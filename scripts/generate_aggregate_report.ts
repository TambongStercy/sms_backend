import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';
import moment from 'moment';
import * as photoUtils from '../src/utils/photoUtils';

const prisma = new PrismaClient();

interface Column {
  label: string;
  sequenceIds: number[];
}

interface Args {
  studentId: number;
  academicYearId: number;
  columns: Column[];
  label: string;
  outFile: string;
}

function parseArgs(): Args {
  const raw = Object.fromEntries(
    process.argv.slice(2).map(a => {
      const [k, ...rest] = a.replace(/^--/, '').split('=');
      return [k, rest.join('=')];
    }),
  );
  // --columns="First Term=1,2;Second Term=3,4;Third Term=5,6"
  const columns: Column[] = raw.columns.split(';').map(part => {
    const [label, ids] = part.split('=');
    return { label: label.trim(), sequenceIds: ids.split(',').map(Number) };
  });
  return {
    studentId: parseInt(raw.student, 10),
    academicYearId: parseInt(raw.year, 10),
    columns,
    label: raw.label,
    outFile: raw.out,
  };
}

function getGrade(mark: number) {
  if (mark >= 18) return 'A+';
  if (mark >= 16) return 'A';
  if (mark >= 15) return 'B+';
  if (mark >= 14) return 'B';
  if (mark >= 12) return 'C+';
  if (mark >= 10) return 'C';
  return 'D';
}

function stddev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

async function main() {
  const args = parseArgs();

  const enrollment = await prisma.enrollment.findFirstOrThrow({
    where: { student_id: args.studentId, academic_year_id: args.academicYearId },
    include: {
      student: true,
      sub_class: {
        include: {
          class: true,
          class_master: { select: { name: true, id: true } },
        },
      },
      academic_year: true,
    },
  });

  if (!enrollment.sub_class_id) throw new Error('Student not assigned to a subclass');
  const subClassId = enrollment.sub_class_id;

  // All (sub_class_subject, subject) rows for the student's subclass
  const scsRows = await prisma.subClassSubject.findMany({
    where: { sub_class_id: subClassId },
    include: {
      subject: true,
      User: { select: { name: true } },
    },
  });

  // All enrollments in the subclass (for class-wide stats)
  const subclassEnrollments = await prisma.enrollment.findMany({
    where: { sub_class_id: subClassId, academic_year_id: args.academicYearId },
    include: { student: true },
  });

  // Pull every mark for those enrollments across every sequence referenced by any column
  const enrollmentIds = subclassEnrollments.map(e => e.id);
  const allSeqIds = Array.from(new Set(args.columns.flatMap(c => c.sequenceIds)));
  const allMarks = await prisma.mark.findMany({
    where: {
      enrollment_id: { in: enrollmentIds },
      exam_sequence_id: { in: allSeqIds },
    },
  });

  type Key = string;
  const key = (eid: number, sid: number): Key => `${eid}:${sid}`;
  const perSeq = new Map<Key, Map<number, number>>();
  for (const m of allMarks) {
    if (m.score == null) continue;
    const k = key(m.enrollment_id, m.sub_class_subject_id);
    if (!perSeq.has(k)) perSeq.set(k, new Map());
    perSeq.get(k)!.set(m.exam_sequence_id, m.score);
  }
  const scoreFor = (eid: number, sid: number, seqId: number): number | null => {
    const m = perSeq.get(key(eid, sid));
    if (!m) return null;
    return m.has(seqId) ? m.get(seqId)! : null;
  };
  // Per-column value = average of scores across that column's sequences (null if none present)
  const columnValueFor = (eid: number, sid: number, col: Column): number | null => {
    const vals = col.sequenceIds
      .map(seqId => scoreFor(eid, sid, seqId))
      .filter((v): v is number => v != null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const columnMarksFor = (eid: number, sid: number): (number | null)[] =>
    args.columns.map(c => columnValueFor(eid, sid, c));
  // Overall subject "mark" = mean of the column values (equal weighting per column)
  const avgScore = (eid: number, sid: number): number => {
    const vals = columnMarksFor(eid, sid).filter((v): v is number => v != null);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  // Per-subject class-wide stats using averaged scores
  const subjectStats = new Map<number, { scores: number[]; min: number; max: number; avg: number; successRate: number }>();
  for (const scs of scsRows) {
    const scores = subclassEnrollments.map(e => avgScore(e.id, scs.id));
    const passed = scores.filter(s => s >= 10).length;
    subjectStats.set(scs.id, {
      scores,
      min: scores.length ? Math.min(...scores) : 0,
      max: scores.length ? Math.max(...scores) : 0,
      avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      successRate: scores.length ? (passed / scores.length) * 100 : 0,
    });
  }

  // Overall average per student (weighted by coefficient)
  const overallByEnrollment = new Map<number, number>();
  for (const e of subclassEnrollments) {
    let totalWeighted = 0;
    let totalCoef = 0;
    for (const scs of scsRows) {
      totalWeighted += avgScore(e.id, scs.id) * scs.coefficient;
      totalCoef += scs.coefficient;
    }
    overallByEnrollment.set(e.id, totalCoef > 0 ? totalWeighted / totalCoef : 0);
  }

  // Rank the target student
  const ranked = Array.from(overallByEnrollment.entries()).sort((a, b) => b[1] - a[1]);
  const rankIndex = ranked.findIndex(([eid]) => eid === enrollment.id);
  const rank = rankIndex >= 0 ? `${rankIndex + 1}th` : 'N/A';

  const overallAverage = overallByEnrollment.get(enrollment.id) ?? 0;
  const totalWeightedStudent = scsRows.reduce((s, scs) => s + avgScore(enrollment.id, scs.id) * scs.coefficient, 0);
  const totalCoefStudent = scsRows.reduce((s, scs) => s + scs.coefficient, 0);

  // Subject rows for the report
  const subjects = scsRows.map(scs => {
    const mark = avgScore(enrollment.id, scs.id);
    const stats = subjectStats.get(scs.id)!;
    const scoresForSubject = subclassEnrollments
      .map(e => ({ eid: e.id, score: avgScore(e.id, scs.id) }))
      .sort((a, b) => b.score - a.score);
    const subjRankIndex = scoresForSubject.findIndex(x => x.eid === enrollment.id);
    return {
      category: scs.subject.category,
      name: scs.subject.name,
      coefficient: scs.coefficient,
      mark,
      sequenceMarks: columnMarksFor(enrollment.id, scs.id),
      weightedMark: mark * scs.coefficient,
      rank: subjRankIndex >= 0 ? `${subjRankIndex + 1}th` : 'N/A',
      teacher: scs.User?.name || 'Not Assigned',
      min: parseFloat(stats.min.toFixed(2)),
      avg: parseFloat(stats.avg.toFixed(2)),
      max: parseFloat(stats.max.toFixed(2)),
      successRate: parseFloat(stats.successRate.toFixed(2)),
      grade: getGrade(mark),
    };
  });

  // Category summaries
  const categories = Array.from(new Set(subjects.map(s => s.category as unknown as string)));
  const categorySummaries = categories.map(category => {
    const subs = subjects.filter(s => (s.category as unknown as string) === category);
    const totalMark = subs.reduce((s, x) => s + x.mark, 0);
    const totalCoef = subs.reduce((s, x) => s + x.coefficient, 0);
    const totalWeighted = subs.reduce((s, x) => s + x.weightedMark, 0);
    const categoryAverage = totalCoef > 0 ? totalWeighted / totalCoef : 0;
    // student rank in this category
    const catAveragesByEnrollment = subclassEnrollments.map(e => {
      const catScs = scsRows.filter(scs => (scs.subject.category as unknown as string) === category);
      const w = catScs.reduce((s, scs) => s + avgScore(e.id, scs.id) * scs.coefficient, 0);
      const c = catScs.reduce((s, scs) => s + scs.coefficient, 0);
      return { eid: e.id, avg: c > 0 ? w / c : 0 };
    }).sort((a, b) => b.avg - a.avg);
    const catRankIndex = catAveragesByEnrollment.findIndex(x => x.eid === enrollment.id);
    // class-wide category stats
    const catStats = subs.map(x => subjectStats.get(scsRows.find(scs => scs.subject.name === x.name)!.id)!);
    const catMin = Math.min(...catStats.map(x => x.min));
    const catMax = Math.max(...catStats.map(x => x.max));
    const catAvg = catStats.reduce((s, x) => s + x.avg, 0) / (catStats.length || 1);
    const catSuccess = catStats.reduce((s, x) => s + x.successRate, 0) / (catStats.length || 1);
    return {
      category,
      totalMark,
      totalCoef,
      totalWeightedMark: totalWeighted,
      categoryAverage,
      categoryGrade: getGrade(categoryAverage),
      categoryMin: parseFloat(catMin.toFixed(2)),
      categoryMax: parseFloat(catMax.toFixed(2)),
      categoryAvg: parseFloat(catAvg.toFixed(2)),
      categorySuccessRate: parseFloat(catSuccess.toFixed(2)),
      categoryRank: catRankIndex >= 0 ? `${catRankIndex + 1}th` : 'N/A',
    };
  });

  const classAverages = Array.from(overallByEnrollment.values());
  const classStats = {
    lowestAverage: classAverages.length ? Math.min(...classAverages).toFixed(2) : '0.00',
    highestAverage: classAverages.length ? Math.max(...classAverages).toFixed(2) : '0.00',
    successRate: classAverages.length ? (classAverages.filter(a => a >= 10).length / classAverages.length) * 100 : 0,
    standardDeviation: stddev(classAverages).toFixed(2),
    classAverage: classAverages.length ? (classAverages.reduce((a, b) => a + b, 0) / classAverages.length).toFixed(2) : '0.00',
  };

  const academicYearName = enrollment.academic_year
    ? `${new Date(enrollment.academic_year.start_date).getFullYear()}-${new Date(enrollment.academic_year.end_date).getFullYear()}`
    : '';

  const reportData = {
    student: {
      name: enrollment.student.name,
      matricule: enrollment.student.matricule,
      dateOfBirth: moment(enrollment.student.date_of_birth).format('DD/MM/YY'),
      placeOfBirth: enrollment.student.place_of_birth,
      gender: enrollment.student.gender,
      repeater: enrollment.repeater,
      photo: enrollment.photo || 'default-photo.jpg',
    },
    classInfo: {
      className: enrollment.sub_class!.name,
      enrolledStudents: subclassEnrollments.length,
      classMaster: enrollment.sub_class!.class_master?.name || 'Not Assigned',
      academicYear: academicYearName,
    },
    subjects,
    categories,
    categorySummaries,
    totals: {
      totalMark: totalWeightedStudent,
      totalCoef: totalCoefStudent,
      totalWeightedMark: totalWeightedStudent,
      overallAverage,
      overallGrade: getGrade(overallAverage),
    },
    statistics: {
      overallAverage: overallAverage.toFixed(2),
      rank,
      subjectsPassed: subjects.filter(s => s.mark >= 10).length,
      classStats,
    },
    examSequence: {
      name: args.label,
      sequenceNumber: 0,
      termName: args.label,
    },
  };

  // Load multi-sequence template and override hardcoded header text
  const templatePath = path.join(process.cwd(), 'src/view/report-template-multi-sequence.ejs');
  let template = fs.readFileSync(templatePath, 'utf-8');
  template = template.replace(
    /<p class="font-bold ">2024 - 2025 \/ Evaluation N° 2<\/p>/,
    `<p class="font-bold ">${academicYearName} / ${args.label}</p>`,
  );
  template = template.replace(
    /\/Evaluation N°2/,
    `/${args.label}`,
  );

  const sequenceLabels = args.columns.map(c => c.label);
  const html = ejs.render(template, { ...reportData, sequenceLabels, photoUtils });

  const outAbs = path.isAbsolute(args.outFile) ? args.outFile : path.join(process.cwd(), args.outFile);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outAbs,
    format: 'A3',
    printBackground: true,
    margin: { top: '4mm', right: '4mm', bottom: '4mm', left: '4mm' },
    preferCSSPageSize: true,
    scale: 0.9,
    pageRanges: '1',
  });
  await browser.close();

  console.log(JSON.stringify({
    label: args.label,
    columns: args.columns,
    outFile: outAbs,
    overallAverage: overallAverage.toFixed(2),
    rank,
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
