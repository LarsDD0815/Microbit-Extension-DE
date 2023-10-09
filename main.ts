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
enum LEDColor {
    //% block=Regenbogen
    Rainbow = 4095,
    //% block=aus
    Off = 0
}

//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Motor', 'Servo', 'LED', 'Sensor']"
namespace mecanumRobotV2 {

    //% block="Motoren per Bluetooth steuern: $bluetoothUARTWerte"
    //% group="Motor" weight=95
    export function stelleMotorenPerBluetooth(bluetoothUARTWerte: String) {

        let rohdaten = bluetoothUARTWerte.split("|");
        
        let motorVorneRechts = parseInt(rohdaten[0]);
        let motorVorneLinks = parseInt(rohdaten[1]);
        let motorHintenRechts = parseInt(rohdaten[2]);
        let motorHintenLinks = parseInt(rohdaten[3]);

        let distanceInCentimeters = entfernungInZentimetern();

        stelleMotor(0x01, 0x02, motorVorneRechts, distanceInCentimeters);
        stelleMotor(0x03, 0x04, motorVorneLinks, distanceInCentimeters);
        stelleMotor(0x05, 0x06, motorHintenRechts, distanceInCentimeters);
        stelleMotor(0x07, 0x08, motorHintenLinks, distanceInCentimeters);
    }

    //% block="Vorwörts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=100
    export function motorenVorwärts(speed: number) {

        let distanceInCentimeters = entfernungInZentimetern();
        let adjustedSpeed = ermittleGeschwindigkeit(speed, distanceInCentimeters);
             
        motorVorneLinks(EngineRotationDirection.Forward, adjustedSpeed);
        motorVorneRechts(EngineRotationDirection.Forward, adjustedSpeed);
        motorHintenLinks(EngineRotationDirection.Forward, adjustedSpeed);
        motorHintenRechts(EngineRotationDirection.Forward, adjustedSpeed);
    }

    //% block="Rückwärts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function motorenRückwärts(speed: number) {

        motorVorneLinks(EngineRotationDirection.Back, speed);
        motorVorneRechts(EngineRotationDirection.Back, speed);
        motorHintenLinks(EngineRotationDirection.Back, speed);
        motorHintenRechts(EngineRotationDirection.Back, speed);
    }

    //% block="Rechts drehen mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function rechtsDrehen(speed: number) {

        motorVorneLinks(EngineRotationDirection.Forward, speed);
        motorVorneRechts(EngineRotationDirection.Back, speed);
        motorHintenLinks(EngineRotationDirection.Forward, speed);
        motorHintenRechts(EngineRotationDirection.Back, speed);
    }

    //% block="Links drehen mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=99
    export function linksDrehen(speed: number) {

        motorVorneLinks(EngineRotationDirection.Back, speed);
        motorVorneRechts(EngineRotationDirection.Forward, speed);
        motorHintenLinks(EngineRotationDirection.Back, speed);
        motorHintenRechts(EngineRotationDirection.Forward, speed);
    }

    //% block="anhalten"
    //% group="Motor" weight=98
    export function motorenAnhalten() {
        i2cWrite(0x01, 0); //M1A
        i2cWrite(0x02, 0); //M1B
        i2cWrite(0x03, 0); //M1A
        i2cWrite(0x04, 0); //M1B
        i2cWrite(0x05, 0); //M1A
        i2cWrite(0x06, 0); //M1B
        i2cWrite(0x07, 0); //M1A
        i2cWrite(0x08, 0); //M1B
    }

    export function fahreBisHindernis(speed: number) {

        while (entfernungInZentimetern() > 20) {
            motorenVorwärts(speed);
        }
        
        motorenAnhalten();
    }

    export function fineNeueRichtung() {

        let compassAngle = input.compassHeading();

        basic.showNumber(compassAngle);

        basic.pause(5000)

        let maximaleEnternungZumHindernis = 0;
        let servoAusschlagitMaximalerEnternungZumHindernis = -180; // Umdrehen
        for (let servoAusschlag = -90; servoAusschlag <= 90; servoAusschlag++) {
            
            setServo(servoAusschlag);

            const entfernungZumHindernis = entfernungInZentimetern()
            if (entfernungZumHindernis > 30 && entfernungZumHindernis > maximaleEnternungZumHindernis) {
                maximaleEnternungZumHindernis = entfernungZumHindernis;
                servoAusschlagitMaximalerEnternungZumHindernis = servoAusschlag;
            }
        }

        setServo(0);

        let targetAngle = compassAngle + servoAusschlagitMaximalerEnternungZumHindernis;
        if (targetAngle > 360) {
            targetAngle -= 360;
        } else if (targetAngle < 0) {
            targetAngle += 360;
        }

        basic.showNumber(targetAngle);

        basic.pause(5000)

        return targetAngle;
    }

    export function ausrichten(targetAngle: number) {

        const currentAngle = input.compassHeading();

        const diffAngle = targetAngle - currentAngle;
        let turningDirection = "RIGHT";

        if (diffAngle >= 180 || (diffAngle < 0 && diffAngle >= -180)) {
            turningDirection = "LEFT";
        }

        while (Math.abs(targetAngle - input.compassHeading()) > 5) {
            if (turningDirection == 'RIGHT') {
                rechtsDrehen(5);
            } else {
                linksDrehen(5)
            }
        }
    }

    //% block="LED $led $ledColor"
    //% group="LED" weight=76
    export function setLed(led: LED, ledColor: LEDColor) {
        i2cWrite(led, ledColor);
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
    //% block="Enternung zum Hindernis"
    //% group="Sensor" weight=68
    export function entfernungInZentimetern(): number {
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

        let distanceInCentimeters = Math.round(ret / 58);

        return distanceInCentimeters > 600 ? 0 : distanceInCentimeters;
    }

    function motorVorneRechts(engineRotationDirection: EngineRotationDirection, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x01, 0); //M2A
            i2cWrite(0x02, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x01, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x02, 0); //M2B
        }
    }

    function motorVorneLinks(engineRotationDirection: EngineRotationDirection, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x03, 0); //M2A
            i2cWrite(0x04, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x03, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x04, 0); //M2B
        }
    }

    function motorHintenLinks(engineRotationDirection: EngineRotationDirection, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x07, 0); //M2A
            i2cWrite(0x08, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x07, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x08, 0); //M2B
        }
    }

    function motorHintenRechts(engineRotationDirection: EngineRotationDirection, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x05, 0); //M2A
            i2cWrite(0x06, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x05, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x06, 0); //M2B
        }
    }

    function stelleMotor(adresse1: number, adresse2: number, speed: number, distanceInCentimeters : number) {
        
        if (speed == 0) {
            i2cWrite(adresse1, 0);
            i2cWrite(adresse2, 0);
        } else if (speed > 0) {

            let adjustedSpeed = ermittleGeschwindigkeit(speed, distanceInCentimeters);

            i2cWrite(adresse1, 0);
            i2cWrite(adresse2, konvertiereInMotorSteuerwert(adjustedSpeed));
        } else {
            i2cWrite(adresse2, 0);
            i2cWrite(adresse1, konvertiereInMotorSteuerwert(speed));
        }
    }

    function ermittleGeschwindigkeit(targetSpeed: number, distanceInCentimeters : number) {

        if (distanceInCentimeters < 10) {
            return 0;
        } else if (distanceInCentimeters > 50) {
            return targetSpeed;
        }

        return Math.map(distanceInCentimeters, 10, 50, 0, 35);
    }

    function konvertiereInMotorSteuerwert(speed: number) {
        return Math.trunc(Math.map(Math.abs(speed), 0, 100, 0, 255));
    }

    function i2cWrite(reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(0x30, buf)
    }
}
