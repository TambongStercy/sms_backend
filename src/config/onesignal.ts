// src/config/onesignal.ts
//
// Thin wrapper around the OneSignal REST API for server-side push delivery.
// Targeting uses OneSignal's `external_id` alias (set from the mobile app via
// `OneSignal.login(userId)`), so no player/subscription IDs are stored here.

import axios, { AxiosInstance } from 'axios';

const ONESIGNAL_BASE_URL = 'https://api.onesignal.com';

export interface PushPayload {
    userIds: (number | string)[];
    title: string;
    body: string;
    data?: Record<string, any>;
    url?: string;
    /** When true, delivered as a heads-up / high-priority push and the client
     *  should render an in-app modal (see notificationService priority mapping). */
    highPriority?: boolean;
}

export interface PushResult {
    sent: boolean;
    skipped?: 'missing_credentials' | 'no_recipients' | 'disabled';
    oneSignalId?: string;
    recipients?: number;
    errors?: any;
}

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance | null {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_API_KEY;
    if (!appId || !apiKey) return null;
    if (!client) {
        client = axios.create({
            baseURL: ONESIGNAL_BASE_URL,
            timeout: 10_000,
            headers: {
                Authorization: `Key ${apiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }
    return client;
}

export function isOneSignalConfigured(): boolean {
    return Boolean(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY);
}

/**
 * Send a push to one or more users, addressed by external_id (= user.id).
 * Never throws — returns a PushResult and logs failures. Callers should
 * fire-and-forget so a push failure never blocks the DB write.
 */
export async function sendPush(payload: PushPayload): Promise<PushResult> {
    if (process.env.ENABLE_NOTIFICATIONS === 'false') {
        return { sent: false, skipped: 'disabled' };
    }
    const http = getClient();
    if (!http) {
        return { sent: false, skipped: 'missing_credentials' };
    }
    const externalIds = Array.from(
        new Set(payload.userIds.filter((v) => v !== null && v !== undefined).map(String))
    );
    if (externalIds.length === 0) {
        return { sent: false, skipped: 'no_recipients' };
    }

    const body: Record<string, any> = {
        app_id: process.env.ONESIGNAL_APP_ID,
        target_channel: 'push',
        include_aliases: { external_id: externalIds },
        headings: { en: payload.title },
        contents: { en: payload.body },
        // FCM NORMAL (priority 5) can be deferred/batched in Doze, producing
        // silent background delivery regardless of channel importance. Default
        // to HIGH so backgrounded devices actually banner.
        priority: 10,
        android_visibility: 1,
    };
    if (payload.data && Object.keys(payload.data).length > 0) {
        body.data = payload.data;
    }
    if (payload.url) {
        body.url = payload.url;
    }
    if (payload.highPriority) {
        // OneSignal accepts ios_interruption_level values: active, passive, time_sensitive, critical.
        body.ios_interruption_level = 'time_sensitive';
    }

    try {
        const res = await http.post('/notifications', body);
        return {
            sent: true,
            oneSignalId: res.data?.id,
            recipients: res.data?.recipients,
            errors: res.data?.errors,
        };
    } catch (err: any) {
        const detail = err?.response?.data ?? err?.message ?? err;
        console.error('[OneSignal] send failed:', JSON.stringify(detail));
        return { sent: false, errors: detail };
    }
}

/**
 * Verify credentials by fetching the OneSignal app record. Used by the
 * test-push endpoint so ops can confirm the wiring without waiting for a
 * real workflow event.
 */
export async function pingOneSignal(): Promise<{ ok: boolean; app?: any; error?: any }> {
    const http = getClient();
    if (!http) return { ok: false, error: 'missing_credentials' };
    try {
        const res = await http.get(`/apps/${process.env.ONESIGNAL_APP_ID}`);
        return { ok: true, app: { id: res.data?.id, name: res.data?.name } };
    } catch (err: any) {
        return { ok: false, error: err?.response?.data ?? err?.message ?? err };
    }
}
