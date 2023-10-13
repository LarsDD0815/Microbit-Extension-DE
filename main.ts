enum TurnWheels {
    Forward = 0,
    Backwards = 1
}

enum RotationDirection {
    Right,
    Left
}

const rotationSpeed = 5;
const minDistanceInCentimeters = 15;
const distanceMesurementThreshold = 15;
const minimumEngineSpeed = 20;

let currentSpeed = 0;

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
    //% group="Motor"
    export function stelleMotorenPerBluetooth(bluetoothUARTWerte: String) {

        let rohdaten = bluetoothUARTWerte.split("|");
        
        let motorVorneRechts = parseInt(rohdaten[0]);
        let motorVorneLinks = parseInt(rohdaten[1]);
        let motorHintenRechts = parseInt(rohdaten[2]);
        let motorHintenLinks = parseInt(rohdaten[3]);

        let distanceInCentimeters = aktuelleEntfernungInZentimetern();

        stelleMotor(0x01, 0x02, motorVorneRechts, distanceInCentimeters);
        stelleMotor(0x03, 0x04, motorVorneLinks, distanceInCentimeters);
        stelleMotor(0x05, 0x06, motorHintenRechts, distanceInCentimeters);
        stelleMotor(0x07, 0x08, motorHintenLinks, distanceInCentimeters);
    }

    //% block="Vorwörts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor"
    export function motorenVorwärts(speed: number) {
          
        motorVorneLinks(TurnWheels.Forward, speed);
        motorVorneRechts(TurnWheels.Forward, speed);
        motorHintenLinks(TurnWheels.Forward, speed);
        motorHintenRechts(TurnWheels.Forward, speed);
    }

    //% block="Rückwärts mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor"
    export function motorenRückwärts(speed: number) {

        motorVorneLinks(TurnWheels.Backwards, speed);
        motorVorneRechts(TurnWheels.Backwards, speed);
        motorHintenLinks(TurnWheels.Backwards, speed);
        motorHintenRechts(TurnWheels.Backwards, speed);
    }

    //% block="Rechts drehen mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor"
    export function rechtsDrehen(speed: number) {

        motorVorneLinks(TurnWheels.Forward, speed);
        motorVorneRechts(TurnWheels.Backwards, speed);
        motorHintenLinks(TurnWheels.Forward, speed);
        motorHintenRechts(TurnWheels.Backwards, speed);
    }

    //% block="Links drehen mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor"
    export function linksDrehen(speed: number) {

        motorVorneLinks(TurnWheels.Backwards, speed);
        motorVorneRechts(TurnWheels.Forward, speed);
        motorHintenLinks(TurnWheels.Backwards, speed);
        motorHintenRechts(TurnWheels.Forward, speed);
    }

    //% block="Motor anhalten"
    //% group="Motor"
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

    //% block="Finde den Weg: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor"
    export function folgeWeg(speed: number) {

        let currentForwardSpeed = 0;

        basic.forever(function () {

            let distanceInCentimeters = aktuelleEntfernungInZentimetern();
            let adjustedSpeed = ermittleGeschwindigkeit(speed, distanceInCentimeters);
            
            if (currentForwardSpeed == adjustedSpeed) {
                return;
            }

            currentForwardSpeed = adjustedSpeed;

            if (currentForwardSpeed > 0) {
                motorenVorwärts(currentForwardSpeed);
            } else {
                motorenAnhalten();

                currentForwardSpeed = 0;

                neuAusrichten();
            }
        });
    }

    //% block="Liniensensor $sensor"
    //% group="Sensor"
    export function LineTracking(sensor: LineTrackingSensor) {

        switch (sensor) {
            case LineTrackingSensor.Left:
                return pins.digitalReadPin(DigitalPin.P3);
            case LineTrackingSensor.Right:
                return pins.digitalReadPin(DigitalPin.P10);
            case LineTrackingSensor.Center:
                return pins.digitalReadPin(DigitalPin.P4);
        }

        return null;
    }

    const smoothingInvervallSize = 5;

    let recentDistances: number[] = [];    
    let recentOutlierDistances: number[] = [];

    let currentDistanceInCentimeters: number = 0;

    basic.forever(function () {

        const currentDistance = entfernungInZentimetern();
        const currentAverageDistance = calculateAverage(recentDistances);

        if (currentDistance == null) {
            return;               
        }

        if (recentDistances.length == smoothingInvervallSize && Math.abs(currentDistance - currentAverageDistance) > currentAverageDistance * 3) {

            const averageOutlierDistance = calculateAverage(recentOutlierDistances);
            recentOutlierDistances.push(currentDistance);
            
            if (recentOutlierDistances.length == smoothingInvervallSize && Math.abs(currentDistance - averageOutlierDistance) < averageOutlierDistance * 1,5) {
                
                recentOutlierDistances = [];
                recentDistances = recentOutlierDistances;
            }

            if (recentOutlierDistances.length > smoothingInvervallSize) {
                recentOutlierDistances.shift();
            }
        }

        recentDistances.push(currentDistance);
        
        if (recentDistances.length > smoothingInvervallSize) {
            recentDistances.shift();
        }

        currentDistanceInCentimeters = calculateAverage(recentDistances);        
    })

    //% block="Mittlere Enternung zum Hindernis"
    //% group="Sensor"
    export function aktuelleEntfernungInZentimetern(): number {
        return currentDistanceInCentimeters;
    }

    function entfernungInZentimetern(): number {

        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P15, 0)
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P15, 1)
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P15, 0)

        // read echo pulse  max distance : 6m(35000us)  
        const laufzeitInMilliseconds = pins.pulseIn(DigitalPin.P16, PulseValue.High, 35000);

        if (laufzeitInMilliseconds != 0) {
            return Math.round(laufzeitInMilliseconds / 58);
        }

        return null;
    }

    function calculateAverage(values: number[]): number {
 
        if (values.length == 0) {
            return 0;
        }
 
        let sumOfValues = 0;
 
        values.forEach(function (value, idx) {
            sumOfValues += value;
        });

        return Math.round(sumOfValues / values.length);
    }

    function findeNeueRichtung_servo() {

        setServo(0);

        let compassAngle = input.compassHeading();

        basic.showNumber(compassAngle);
        basic.pause(5000);

        let maximaleEnternungZumHindernis = 0;
        let servoAusschlagMitMaximalerEnternungZumHindernis = -180; // Umdrehen
        for (let servoAusschlag = -90; servoAusschlag <= 90; servoAusschlag++) {
            
            basic.showNumber(servoAusschlag);
            basic.pause(100);

            setServo(servoAusschlag);

            const entfernungZumHindernis = aktuelleEntfernungInZentimetern()
            if (entfernungZumHindernis <= minDistanceInCentimeters) {
                continue;
            }

            
            if (entfernungZumHindernis <= maximaleEnternungZumHindernis) {
                continue;
            }
               
            maximaleEnternungZumHindernis = entfernungZumHindernis;
            servoAusschlagMitMaximalerEnternungZumHindernis = servoAusschlag;
        }

        setServo(0);

        let targetAngle = compassAngle + servoAusschlagMitMaximalerEnternungZumHindernis;
        if (targetAngle > 360) {
            targetAngle -= 360;
        } else if (targetAngle < 0) {
            targetAngle += 360;
        }

        basic.showNumber(targetAngle);
        basic.pause(5000)

        return targetAngle;
    }

    function neuAusrichten() {

        let maxDistance = 0;

        rechtsDrehen(rotationSpeed);

        let start = input.runningTime();

        while (input.runningTime() < start + 4000) {
            const currentDistance = aktuelleEntfernungInZentimetern();

            if (currentDistance > maxDistance) {
                maxDistance = currentDistance;
            }
        }

        linksDrehen(rotationSpeed);

        while (true) {

            const currentDistance = aktuelleEntfernungInZentimetern();

            if (Math.abs(maxDistance - currentDistance) < distanceMesurementThreshold) {
                break;
            }
        }
    }

   
    //% block="set servo to angle %angle"
    //% group="Servo" weight=70
    //% angle.min=-90 angle.max.max=90
    export function setServo(angle: number): void {
        pins.servoWritePin(AnalogPin.P14, angle + 90)
    }

    function motorVorneRechts(engineRotationDirection: TurnWheels, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x01, 0); //M2A
            i2cWrite(0x02, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x01, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x02, 0); //M2B
        }
    }

    function motorVorneLinks(engineRotationDirection: TurnWheels, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x03, 0); //M2A
            i2cWrite(0x04, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x03, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x04, 0); //M2B
        }
    }

    function motorHintenLinks(engineRotationDirection: TurnWheels, speed: number) {

        if (engineRotationDirection == 0) {
            i2cWrite(0x07, 0); //M2A
            i2cWrite(0x08, konvertiereInMotorSteuerwert(speed)); //M2B
        } else if (engineRotationDirection == 1) {
            i2cWrite(0x07, konvertiereInMotorSteuerwert(speed)); //M2A
            i2cWrite(0x08, 0); //M2B
        }
    }

    function motorHintenRechts(engineRotationDirection: TurnWheels, speed: number) {

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

        if (distanceInCentimeters > 100) {
            return targetSpeed;
        } else if (distanceInCentimeters < minDistanceInCentimeters) {
            return 0;
        }

        const maxSpeed = Math.map(distanceInCentimeters, minDistanceInCentimeters, 100, 1, 20);

        return Math.min(targetSpeed, maxSpeed);
    }

    function konvertiereInMotorSteuerwert(speed: number) {
        if (speed == 0) {
            return 0;
        }

        return Math.trunc(Math.map(Math.abs(speed), 1, 100, 32, 255));
    }

    function i2cWrite(reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(0x30, buf)
    }
}
