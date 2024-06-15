
namespace Entfernungssensor {

    export const aktuelleEntfernungInZentimetern = (): number => {

        const entfernung = Tools.calculateAverage(messureCurrentDistance);

        serial.writeValue('Entfernung', entfernung);

        return entfernung;
    }
    const messureCurrentDistance = (): number => {

        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P15, 0)
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P15, 1)
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P15, 0)

        // Puls-Laufzeit für Schallgescwindigkeit bei einer Maximalen Mess-Entfernung von 3 m > 1s/340m*(2 * 3m) > 0,01764705882s
        const laufzeitInMilliseconds = pins.pulseIn(DigitalPin.P16, PulseValue.High, 18000);

        if (laufzeitInMilliseconds != 0) {
            return Math.round(laufzeitInMilliseconds / 58);
        }

        return 300;
    }
}

namespace Kompass {

    export function aktuelleKompassausrichtung(): number {

        const ausrichtung = Tools.calculateAverage(() => input.compassHeading());

        serial.writeValue('Ausrichtung', ausrichtung);

        return ausrichtung;
    }

    export function normalisiereWinkel(winkel: number): number {

        let zielwinkel = winkel;

        if (zielwinkel > 360) {
            zielwinkel -= 360;
        } else if (zielwinkel < 0) {
            zielwinkel += 360;
        }

        return zielwinkel;
    }

    export function zielwinkelErreicht(zielwinkel: number): boolean {

        const aktuellerWinklel = aktuelleKompassausrichtung()

        return Math.abs(zielwinkel - aktuellerWinklel) <= 10
    }
}

//% block="Servo"
namespace Servo {

    //% block="Servo stellen auf Winkel: $winkel \\%"
    //% winkel.min=-80 winkel.max=80
    export const stelleServo = (winkel: number): void => {

        const stellwinkel = winkel + 90

        console.log(`Servo: ${stellwinkel}`);

        pins.servoWritePin(AnalogPin.P14, stellwinkel)
    }
}

namespace Motoren {

    class Rad {

        register1: number;
        register2: number;

        constructor(register1: number, register2: number) {
            this.register1 = register1;
            this.register2 = register2;
        }

        vorwaerts(geschwindigkeit: number): void {
            Rad.setEngineSpeedValue(this.register1, 0);
            Rad.setEngineSpeedValue(this.register2, geschwindigkeit);
        }

        rueckwaerts(geschwindigkeit: number): void {
            Rad.setEngineSpeedValue(this.register1, geschwindigkeit);
            Rad.setEngineSpeedValue(this.register2, 0);
        }

        stop(): void {
            Rad.setEngineSpeedValue(this.register1, 0);
            Rad.setEngineSpeedValue(this.register2, 0);
        }

        static setEngineSpeedValue = (engineRegister: number, speed: number): void => {
            let buf = pins.createBuffer(2)
            buf[0] = engineRegister
            buf[1] = speed == 0 ? 0 : Math.trunc(Math.map(Math.abs(speed), 1, 100, 32, 255))
            pins.i2cWriteBuffer(0x30, buf)
        }
    }

    const VORNE_RECHTS = new Rad(0x01, 0x02);
    const VORNE_LINKS = new Rad(0x03, 0x04);
    const HINTEN_RECHTS = new Rad(0x05, 0x06);
    const HINTEN_LINKS = new Rad(0x07, 0x08);

    export const vorwaerts = (geschwindigkeit: number): void => {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    export const rueckwaerts = (geschwindigkeit: number): void => {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    export const links = (geschwindigkeit: number): void => {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    export const rechts = (geschwindigkeit: number): void => {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    export const stop = (): void => {
        VORNE_LINKS.stop();
        VORNE_RECHTS.stop();
        HINTEN_LINKS.stop();
        HINTEN_RECHTS.stop();
    }
}

namespace Tools {
    export const calculateAverage = (valueComputeFunction: () => number): number => {
        const values: number[] = [];

        for (let i = 0; i < 10; i++) {
            values[i] = valueComputeFunction();
        }

        const valuesWithoutOutliers = filterOutliers(values)

        let sumOfValues = 0;

        valuesWithoutOutliers.forEach(function (value: number) {
            sumOfValues += value;
        });


        return Math.round(sumOfValues / valuesWithoutOutliers.length);
    }

    export const filterOutliers = (initialArray: number[]): number[] => {
        let values, q1, q3, iqr, maxValue: number, minValue: number;
        values = initialArray.slice().sort((a, b) => a - b);//copy array fast and sort
        if ((values.length / 4) % 1 === 0) {//find quartiles
            q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
            q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
        } else {
            q1 = values[Math.floor(values.length / 4 + 1)];
            q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
        }
        iqr = q3 - q1;
        maxValue = q3 + iqr * 1.5;
        minValue = q1 - iqr * 1.5;
        return values.filter((x) => (x >= minValue) && (x <= maxValue));
    }
}