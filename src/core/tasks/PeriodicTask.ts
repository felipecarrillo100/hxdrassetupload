export class PeriodicTask {
    private period: number;
    private running: boolean;
    constructor(options: {period:number}) {
        this.period = options.period;
        this.running = true;
    }

    protected async mainJob() {
        // Implement your code here
    }
    startTask() {
        this.running = true;
        this.coreLoop();
    }

    protected coreLoop() {
        setTimeout(()=>{
            if (this.running) {
                this.mainJobWrapper();
                this.coreLoop();
            }
        }, this.period)
    }
    protected mainJobWrapper = async () => {
        await this.mainJob();
    }
    stopTask() {
       this.running = false;
    }
}
