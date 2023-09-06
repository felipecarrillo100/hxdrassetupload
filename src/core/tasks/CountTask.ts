import {PeriodicTask} from "./PeriodicTask";

export class CountTask extends PeriodicTask {
    private counter: number;
    private max: number;
    constructor(o:{start:number, stop:number}) {
        super({period:1000});
        this.counter = o.start;
        this.max = o.stop;
    }

    protected async mainJob() {
        console.log(this.counter++);
        if (this.counter>this.max) {
            this.stopTask();
        }
    }
}
