enum EngineRotationDirection {
    //% block="vorwärts"
    Forward = 0,
    //% block="rückwärts"
    Back = 1
}
enum LineTrackingSensor {
    //% block="links"
    Left,
    //% block="mitte"
    Center,
    //% block="rechts"
    Right

}
enum LED {
    //% block="links"
    Left = 0x09,
    //% block="rechts"
    Right = 0x0a
}
enum LEDState {
    //% block="an"
    ON = 4095,
    //% block="aus"
    OFF = 0
}

//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Motor', 'Servo', 'LED', 'Sensor']"
namespace mecanumRobotV2 {

    function i2cWrite(reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(0x30, buf)
    }

    //% block="Vorwörts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=100
    export function MotorenVorwärts(speed: number) {

        MotorVorneLinks(EngineRotationDirection.Forward, speed);
        MotorVorneRechts(EngineRotationDirection.Forward, speed);
        MotorHintenLinks(EngineRotationDirection.Forward, speed);
        MotorHintenRechts(EngineRotationDirection.Forward, speed);
    }

    //% block="Rückwärts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function MotorenRückwärts(speed: number) {

        MotorVorneLinks(EngineRotationDirection.Back, speed);
        MotorVorneRechts(EngineRotationDirection.Back, speed);
        MotorHintenLinks(EngineRotationDirection.Back, speed);
        MotorHintenRechts(EngineRotationDirection.Back, speed);
    }

    //% block="anhalten"
    //% group="Motor" weight=98
    export function MotorenAnhalten() {
        i2cWrite(0x01, 0); //M1A
        i2cWrite(0x02, 0); //M1B
        i2cWrite(0x03, 0); //M1A
        i2cWrite(0x04, 0); //M1B
        i2cWrite(0x05, 0); //M1A
        i2cWrite(0x06, 0); //M1B
        i2cWrite(0x07, 0); //M1A
        i2cWrite(0x08, 0); //M1B
    }

    //% block="Vorne rechts $engineRotationDirection mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorVorneRechts(engineRotationDirection: EngineRotationDirection, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (engineRotationDirection == 0) {
            i2cWrite(0x01, 0); //M2A
            i2cWrite(0x02, speed_value); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x01, speed_value); //M2A
            i2cWrite(0x02, 0); //M2B
        }
    }

    //% block="Vorne links $engineRotationDirection mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorVorneLinks(engineRotationDirection: EngineRotationDirection, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (engineRotationDirection == 0) {
            i2cWrite(0x03, 0); //M2A
            i2cWrite(0x04, speed_value); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x03, speed_value); //M2A
            i2cWrite(0x04, 0); //M2B
        }
    }

    //% block="Hinten links $engineRotationDirection mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorHintenLinks(engineRotationDirection: EngineRotationDirection, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (engineRotationDirection == 0) {
            i2cWrite(0x07, 0); //M2A
            i2cWrite(0x08, speed_value); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x07, speed_value); //M2A
            i2cWrite(0x08, 0); //M2B
        }
    }

    //% block="Hinten rechts $engineRotationDirection mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorHintenRechts(engineRotationDirection: EngineRotationDirection, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (engineRotationDirection == 0) {
            i2cWrite(0x05, 0); //M2A
            i2cWrite(0x06, speed_value); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x05, speed_value); //M2A
            i2cWrite(0x06, 0); //M2B
        }
    }

    //% block="LED $LED $LedS"
    //% group="LED" weight=76
    export function setLed(LED: LED, LedS: LEDState) {
        i2cWrite(LED, LedS);
    }

    //% block="Servo auf Winkel %angle einstellen"
    //% group="Servo" weight=70
    //% angle.min=-90 angle.max.max=90
    export function setServo(angle: number): void {
        pins.servoWritePin(AnalogPin.P14, angle + 90)
    }

    //% block="Liniensensor $LT_val"
    //% group="Sensor" weight=69
    export function LineTracking(LT_val: LineTrackingSensor) {
        let val = 0;
        let lt = LT_val;
        switch (lt) {
            case LineTrackingSensor.Left:
                val = pins.digitalReadPin(DigitalPin.P3);
                break;
            case LineTrackingSensor.Right:
                val = pins.digitalReadPin(DigitalPin.P10);
                break;
            case LineTrackingSensor.Center:
                val = pins.digitalReadPin(DigitalPin.P4);
                break;
        }

        return val;
    }

    let lastTime = 0;
    //% block="Ultraschallsensor"
    //% group="Sensor" weight=68
    export function ultra(): number {
        //send trig pulse
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P15, 0)
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P15, 1)
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P15, 0)

        // read echo pulse  max distance : 6m(35000us)  
        let t = pins.pulseIn(DigitalPin.P16, PulseValue.High, 35000);
        let ret = t;

        //Eliminate the occasional bad data
        if (ret == 0 && lastTime != 0) {
            ret = lastTime;
        }
        lastTime = t;

        return Math.round(ret / 58);
    }

}
