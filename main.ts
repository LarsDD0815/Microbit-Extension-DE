
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Räder', 'Entferungssensor', 'Servo', 'Kompass']"
namespace Robotter {

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

    //% block="Vorwärts mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export const vorwaerts = (geschwindigkeit: number): void => {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    //% block="Rückwärts mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export const rueckwaerts = (geschwindigkeit: number): void => {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    //% block="Links drehen mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export const links = (geschwindigkeit: number): void => {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    //% block="Rechts drehen mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export const rechts = (geschwindigkeit: number): void => {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    //% block="Anhalten"
    //% group="Räder"
    export const stop = (): void => {
        VORNE_LINKS.stop();
        VORNE_RECHTS.stop();
        HINTEN_LINKS.stop();
        HINTEN_RECHTS.stop();
    }

    //% block="Servo stellen auf Winkel: $winkel \\%"
    //% group="Servo"
    //% winkel.min=-80 winkel.max=80
    export const stelleServo = (winkel: number): void => {

        const stellwinkel = winkel + 90

        console.log(`Servo: ${stellwinkel}`);

        pins.servoWritePin(AnalogPin.P14, stellwinkel)
    }

    //% block="Aktuelle Entferung in cm"
    //% group="Entferungssensor"
    export const aktuelleEntfernungInZentimetern = (): number => {

        const entfernung = calculateAverage(messureCurrentDistance);

        serial.writeValue('Entfernung', entfernung);

        return entfernung;
    }


    //% block="Aktuelle Kompassausrichtung"
    //% group="Kompass"
    export function aktuelleKompassausrichtung(): number {

        const ausrichtung = calculateAverage(() => input.compassHeading());

        serial.writeValue('Ausrichtung', ausrichtung);

        return ausrichtung;
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

    function normalisiereWinkel(winkel: number): number {

        let zielwinkel = winkel;

        if (zielwinkel > 360) {
            zielwinkel -= 360;
        } else if (zielwinkel < 0) {
            zielwinkel += 360;
        }

        return zielwinkel;
    }

    function zielwinkelErreicht(zielwinkel: number): boolean {

        const aktuellerWinklel = aktuelleKompassausrichtung()

        return Math.abs(zielwinkel - aktuellerWinklel) <= 10
    }

    const calculateAverage = (valueComputeFunction: () => number): number => {

        let sumOfValues = 0;
        for (let i = 0; i < 5; i++) {
            sumOfValues += valueComputeFunction();
        }

        return Math.round(sumOfValues / 5);
    }
}