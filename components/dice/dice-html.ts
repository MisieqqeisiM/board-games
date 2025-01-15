import { LocalDiceObserver } from "./dice.ts";
class HTMLDice implements LocalDiceObserver {
    constructor(private wrapper: any) {
        
    }
    
    onRoll(): void {
       this.wrapper.innerText = "the dice is rolling..." 
    }

    onUpdate(rolledValue: number): void {
        this.wrapper.innerText = `the dice rolled ${rolledValue}`
    }
}
