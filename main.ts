//% color="#ff6800" icon="\uf1b9" weight=1
//% groups="['Räder', 'Entferungssensor', 'Servo', 'Kompass']"
namespace Robotter {

    class Rad {

        register1: number;
        register2: number;
        zielgeschwindigkeit: number = 0;
        aktuelleGescwindigkeit: number = 0;

        constructor(register1: number, register2: number) {
            this.register1 = register1;
            this.register2 = register2;
        }

        vorwaerts(geschwindigkeit: number): void {
            this.zielgeschwindigkeit = geschwindigkeit;
        }

        rueckwaerts(geschwindigkeit: number): void {
            this.zielgeschwindigkeit = -geschwindigkeit;

        }

        stop(): void {
            this.zielgeschwindigkeit = 0;

        }

        steuern(geschwindigkeit: number): void {
            this.zielgeschwindigkeit = geschwindigkeit;
        }
    }

    const VORNE_RECHTS = new Rad(0x01, 0x02);
    const VORNE_LINKS = new Rad(0x03, 0x04);
    const HINTEN_RECHTS = new Rad(0x05, 0x06);
    const HINTEN_LINKS = new Rad(0x07, 0x08);

    //% block="Vorwärts mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export function vorwaerts(geschwindigkeit: number): void {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    //% block="Rückwärts mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export function rueckwaerts(geschwindigkeit: number): void {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    //% block="Links drehen mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export function links(geschwindigkeit: number): void {
        VORNE_LINKS.rueckwaerts(geschwindigkeit);
        VORNE_RECHTS.vorwaerts(geschwindigkeit);
        HINTEN_LINKS.rueckwaerts(geschwindigkeit);
        HINTEN_RECHTS.vorwaerts(geschwindigkeit);
    }

    //% block="Rechts drehen mit Geschwindigkeit: $geschwindigkeit \\%"
    //% group="Räder"
    //% geschwindigkeit.min=-0 geschwindigkeit.max=100
    export function rechts(geschwindigkeit: number): void {
        VORNE_LINKS.vorwaerts(geschwindigkeit);
        VORNE_RECHTS.rueckwaerts(geschwindigkeit);
        HINTEN_LINKS.vorwaerts(geschwindigkeit);
        HINTEN_RECHTS.rueckwaerts(geschwindigkeit);
    }

    //% block="Anhalten"
    //% group="Räder"
    export function stop(): void {
        VORNE_LINKS.stop();
        VORNE_RECHTS.stop();
        HINTEN_LINKS.stop();
        HINTEN_RECHTS.stop();
    }

    //% block="Räder per Bluetooth steuern: $bluetoothUARTWerte"
    //% group="Räder"
    export function stelleMotorenPerBluetooth(bluetoothUARTWerte: String) {
        const rohdaten = bluetoothUARTWerte.split("|");

        const motorVorneRechts = parseInt(rohdaten[0]);
        const motorVorneLinks = parseInt(rohdaten[1]);
        const motorHintenRechts = parseInt(rohdaten[2]);
        const motorHintenLinks = parseInt(rohdaten[3]);

        VORNE_RECHTS.steuern(motorVorneRechts)
        VORNE_LINKS.steuern(motorVorneLinks)
        HINTEN_RECHTS.steuern(motorHintenRechts)
        HINTEN_LINKS.steuern(motorHintenLinks)
    }

    //% block="Servo stellen auf Winkel: $winkel \\%"
    //% group="Servo"
    //% winkel.min=-80 winkel.max=80
    export function stelleServo(winkel: number): void {

        const stellwinkel = winkel + 90

        pins.servoWritePin(AnalogPin.P14, stellwinkel)
    }

    //% block="Aktuelle Entferung in cm"
    //% group="Entferungssensor"
    export function aktuelleEntfernungInZentimetern(): number {

        const entfernung = durchschnitt(entferungMessen);

        return entfernung;
    }

    //% block="Aktuelle Kompassausrichtung"
    //% group="Kompass"
    export function aktuelleKompassausrichtung(): number {

        const ausrichtung = durchschnitt(() => input.compassHeading());

        return ausrichtung;
    }

    //% block="Motorbewegung aktualisieren"
    //% group="Räder"
    export function aktuelisiereMotorbewegung(): void {

        const maximaleVorwaertsgeschwindigkeit = ermittleMaximaleVorwaertsgeschwindigkeit();

        motorSteuern(VORNE_LINKS, Math.min(maximaleVorwaertsgeschwindigkeit, VORNE_LINKS.zielgeschwindigkeit))
        motorSteuern(VORNE_RECHTS, Math.min(maximaleVorwaertsgeschwindigkeit, VORNE_RECHTS.zielgeschwindigkeit))
        motorSteuern(HINTEN_LINKS, Math.min(maximaleVorwaertsgeschwindigkeit, HINTEN_LINKS.zielgeschwindigkeit))
        motorSteuern(HINTEN_RECHTS, Math.min(maximaleVorwaertsgeschwindigkeit, HINTEN_RECHTS.zielgeschwindigkeit))
    }

    function motorSteuern(rad: Rad, geschwindigkeit: number): void {

        if (rad.aktuelleGescwindigkeit == geschwindigkeit) {
            return;
        }

        rad.aktuelleGescwindigkeit = geschwindigkeit;

        let wertRegister1 = 0;
        let wertRegister2 = 0;
        if (geschwindigkeit > 0) {
            wertRegister2 = Math.trunc(Math.map(Math.abs(geschwindigkeit), 1, 100, 32, 255))
        } else if (geschwindigkeit < 0) {
            wertRegister1 = Math.trunc(Math.map(Math.abs(geschwindigkeit), 1, 100, 32, 255))
        }

        const buf1 = pins.createBuffer(2)
        buf1[0] = rad.register1
        buf1[1] = wertRegister1

        const buf2 = pins.createBuffer(2)
        buf2[0] = rad.register2
        buf2[1] = wertRegister2

        pins.i2cWriteBuffer(0x30, buf1)
        pins.i2cWriteBuffer(0x30, buf2)
    }

    function ermittleMaximaleVorwaertsgeschwindigkeit(): number {

        const maximaleGeschindigkkeit = 30
        const minimaleDistanz = 15

        const entferung = aktuelleEntfernungInZentimetern();

        if (entferung > 100) {
            return maximaleGeschindigkkeit;
        } else if (entferung < minimaleDistanz) {
            return 0;
        }

        return Math.map(entferung, minimaleDistanz, 100, 1, maximaleGeschindigkkeit);
    }

    function entferungMessen(): number {

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

    function durchschnitt(valueComputeFunction: () => number): number {

        let sumOfValues = 0;
        for (let i = 0; i < 5; i++) {
            sumOfValues += valueComputeFunction();
        }

        return Math.round(sumOfValues / 5);
    }
}

