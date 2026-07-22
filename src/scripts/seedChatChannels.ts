import prisma from '../config/db';
import { ChannelType, MemberRole, Department, Role } from '@prisma/client';
import { ROLE_DEPARTMENT } from '../utils/roleHierarchy';

/**
 * Idempotent seed for the Slack-style chat workspace.
 *
 * - One DEPARTMENT channel per Department value (except EXTERNAL).
 * - One SUBJECT channel per Subject that has a HOD.
 * - Auto-populates members based on UserRole → Department mapping,
 *   plus HOD + assigned teachers for each subject channel.
 *
 * Safe to run repeatedly (uses upsert / skipDuplicates).
 */
export async function seedChatChannels(): Promise<void> {
    console.log('🔵 seedChatChannels: starting');

    // 1. Department channels
    const departments: Department[] = [
        'ACADEMIC', 'DISCIPLINE', 'FINANCE', 'WELFARE', 'FRONT_OFFICE', 'EXECUTIVE',
    ];

    const deptChannelByDept = new Map<Department, number>();
    for (const dept of departments) {
        const existing = await prisma.chatChannel.findFirst({
            where: { type: 'DEPARTMENT', department: dept },
        });
        if (existing) {
            deptChannelByDept.set(dept, existing.id);
            continue;
        }
        const created = await prisma.chatChannel.create({
            data: {
                name: dept.toLowerCase().replace(/_/g, '-'),
                description: `${dept} department channel`,
                type: 'DEPARTMENT' as ChannelType,
                department: dept,
                is_system: true,
                is_private: false,
            },
        });
        deptChannelByDept.set(dept, created.id);
        console.log(`  ✓ created department channel #${created.id} for ${dept}`);
    }

    // 2. Backfill members: for every UserRole → matching department channel
    // Group all user_roles once
    const allRoles = await prisma.userRole.findMany({ select: { user_id: true, role: true } });

    // { userId -> Set<department> }
    const userDepts = new Map<number, Set<Department>>();
    for (const ur of allRoles) {
        const dept = ROLE_DEPARTMENT[ur.role as Role];
        if (!dept || dept === 'EXTERNAL') continue;
        if (!userDepts.has(ur.user_id)) userDepts.set(ur.user_id, new Set());
        userDepts.get(ur.user_id)!.add(dept as Department);
    }

    let deptMembersAdded = 0;
    for (const [userId, depts] of userDepts.entries()) {
        for (const dept of depts) {
            const channelId = deptChannelByDept.get(dept);
            if (!channelId) continue;
            const existing = await prisma.chatChannelMember.findUnique({
                where: { channel_id_user_id: { channel_id: channelId, user_id: userId } },
            });
            if (existing) continue;
            await prisma.chatChannelMember.create({
                data: { channel_id: channelId, user_id: userId, role: MemberRole.MEMBER },
            });
            deptMembersAdded++;
        }
    }
    console.log(`  ✓ added ${deptMembersAdded} department memberships`);

    // 3. Subject channels — one per Subject with a HOD
    const subjects = await prisma.subject.findMany({
        where: { hod_id: { not: null } },
        select: {
            id: true,
            name: true,
            hod_id: true,
            subject_teachers: { select: { teacher_id: true } },
        },
    });

    let subjectChannelsCreated = 0;
    let subjectMembersAdded = 0;
    for (const s of subjects) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const existing = await prisma.chatChannel.findFirst({
            where: { type: 'SUBJECT', subject_id: s.id },
        });

        let channelId: number;
        if (existing) {
            channelId = existing.id;
        } else {
            const created = await prisma.chatChannel.create({
                data: {
                    name: `subject-${slug}`,
                    description: `${s.name} subject channel`,
                    type: 'SUBJECT' as ChannelType,
                    subject_id: s.id,
                    is_system: true,
                    is_private: false,
                },
            });
            channelId = created.id;
            subjectChannelsCreated++;
        }

        const memberIds = new Set<number>();
        if (s.hod_id) memberIds.add(s.hod_id);
        for (const st of s.subject_teachers) memberIds.add(st.teacher_id);

        for (const uid of memberIds) {
            const already = await prisma.chatChannelMember.findUnique({
                where: { channel_id_user_id: { channel_id: channelId, user_id: uid } },
            });
            if (already) continue;
            await prisma.chatChannelMember.create({
                data: {
                    channel_id: channelId,
                    user_id: uid,
                    role: uid === s.hod_id ? MemberRole.ADMIN : MemberRole.MEMBER,
                },
            });
            subjectMembersAdded++;
        }
    }
    console.log(`  ✓ created ${subjectChannelsCreated} subject channels, added ${subjectMembersAdded} subject memberships`);

    console.log('🟢 seedChatChannels: done');
}
