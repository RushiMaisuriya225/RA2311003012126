import 'dotenv/config';
import { Log } from '../logging_middleware/index';

const BASE_URL = "http://20.207.122.201/evaluation-service";

interface Depot {
    ID: number;
    MechanicHours: number;
}

interface Vehicle {
    TaskID: string;
    Duration: number;
    Impact: number;
}

async function solveVehicleMaintenance() {
    const token = process.env.ACCESS_TOKEN;
    if (!token) {
        console.error("Missing ACCESS_TOKEN in .env file");
        return;
    }

    try {
        await Log("backend", "info", "service", "Started vehicle scheduler");

        const depotRes = await fetch(`${BASE_URL}/depots`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!depotRes.ok) throw new Error(`Depot API failed: ${depotRes.status}`);
        const depotData = await depotRes.json() as { depots: Depot[] };
        
        const totalCapacity = depotData.depots.reduce((sum, depot) => sum + depot.MechanicHours, 0);
        await Log("backend", "info", "service", `Depot capacity: ${totalCapacity} hours`);

        const vehicleRes = await fetch(`${BASE_URL}/vehicles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!vehicleRes.ok) throw new Error(`Vehicle API failed: ${vehicleRes.status}`);
        const vehicleData = await vehicleRes.json() as { vehicles: Vehicle[] };
        const vehicles = vehicleData.vehicles;
        const n = vehicles.length;
        
        await Log("backend", "info", "service", `Fetched ${n} vehicle tasks`);

        await Log("backend", "debug", "service", "Started DP knapsack init");
        
        const dp: number[][] = Array.from({ length: n + 1 }, () => Array(totalCapacity + 1).fill(0));

        for (let i = 1; i <= n; i++) {
            const { Duration, Impact } = vehicles[i - 1];
            for (let w = 0; w <= totalCapacity; w++) {
                if (Duration <= w) {
                    dp[i][w] = Math.max(Impact + dp[i - 1][w - Duration], dp[i - 1][w]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        const maxImpact = dp[n][totalCapacity];

        let w = totalCapacity;
        const selectedTasks: string[] = [];
        let timeUsed = 0;

        for (let i = n; i > 0 && w > 0; i--) {
            if (dp[i][w] !== dp[i - 1][w]) {
                const task = vehicles[i - 1];
                selectedTasks.push(task.TaskID);
                timeUsed += task.Duration;
                w -= task.Duration;
            }
        }

        await Log("backend", "info", "service", `Success. Max Impact: ${maxImpact}`);

        console.log("VEHICLE MAINTENANCE OPTIMIZATION REPORT");
        console.log("=============================================");
        console.log(`Total Available Budget : ${totalCapacity} hours`);
        console.log(`Total Vehicles Checked : ${n} vehicles`);
        console.log(`Maximized Impact Score : ${maxImpact}`);
        console.log(`Total Hours Utilized   : ${timeUsed} hours`);
        console.log(`Total Tasks Scheduled  : ${selectedTasks.length}`);
        console.log("---------------------------------------------");
        console.log("Selected Task IDs:");
        console.log(selectedTasks);
        console.log("=============================================");

    } catch (error: any) {
        await Log("backend", "error", "service", `Scheduler Failed`);
        console.error("[Fatal Error]:", error);
    }
}

solveVehicleMaintenance();