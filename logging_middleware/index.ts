export type StackType = "backend" | "frontend";
export type LevelType = "debug" | "info" | "warn" | "error" | "fatal";

export type BackendPackageType = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "middleware" | "utils" | "auth" | "config";

export async function Log(
    stack: StackType,
    level: LevelType,
    packageName: BackendPackageType,
    message: string
): Promise<void> {
    const token = process.env.ACCESS_TOKEN;
    
    if (!token) {
        console.error("FATAL: Missing ACCESS_TOKEN in environment variables.");
        return;
    }

    try {
        const response = await fetch("http://20.207.122.201/evaluation-service/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                stack: stack,
                level: level,
                package: packageName, 
                message: message
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Middleware Error] Failed to send log. Status: ${response.status}, Error: ${errText}`);
        }
    } catch (error) {
        console.error("[Middleware Error] Network error while sending log:", error);
    }
}