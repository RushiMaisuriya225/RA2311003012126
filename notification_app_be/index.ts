import 'dotenv/config';
import { Log } from '../logging_middleware/index';

const BASE_URL = "http://20.207.122.201/evaluation-service";
const TOKEN = process.env.ACCESS_TOKEN;

interface Notification {
    Type: string;
    Message: string;
    Timestamp: string;
}

const PRIORITY_WEIGHTS: Record<string, number> = {
    'placement': 3,
    'result': 2,
    'event': 1
};

async function getPriorityInbox() {
    try {
        await Log("backend", "info", "service", "Fetching Stage 6 notifications");

        const response = await fetch(`${BASE_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json() as { notifications: Notification[] };
        let allNotifications = data.notifications;

        allNotifications.sort((a, b) => {
            const typeA = a.Type ? a.Type.toLowerCase().trim() : '';
            const typeB = b.Type ? b.Type.toLowerCase().trim() : '';
            
            const weightA = PRIORITY_WEIGHTS[typeA] || 0;
            const weightB = PRIORITY_WEIGHTS[typeB] || 0;

            // Primary Sort: By Weight
            if (weightA !== weightB) {
                return weightB - weightA;
            }

            // Secondary Sort: By Timestamp 
            const safeTimeA = a.Timestamp.replace(' ', 'T');
            const safeTimeB = b.Timestamp.replace(' ', 'T');
            
            return new Date(safeTimeB).getTime() - new Date(safeTimeA).getTime();
        });

        const priorityInbox = allNotifications.slice(0, 10);

        await Log("backend", "info", "handler", "Priority Inbox sorted");

        console.log("======= TOP 10 PRIORITY INBOX =======");
        console.table(priorityInbox);
        
    } catch (error: any) {
        await Log("backend", "error", "handler", "Priority Inbox failed");
        console.error(error.message);
    }
}

getPriorityInbox();