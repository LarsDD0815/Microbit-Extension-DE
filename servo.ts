namespace Robotter {

    //% block="Servo stellen auf Winkel: $winkel \\%"
    //% group="Servo"
    //% winkel.min=-80 winkel.max=80
    export const stelleServo = (winkel: number): void => {

        const stellwinkel = winkel + 90

        console.log(`Servo: ${stellwinkel}`);

        pins.servoWritePin(AnalogPin.P14, stellwinkel)
    }
}
