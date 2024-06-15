namespace Robotter {

    //% block="Aktuelle Entferung in cm"
    //% group="Entferungssensor"
    export const aktuelleEntfernungInZentimetern = (): number => {

        const entfernung = calculateAverage(messureCurrentDistance);

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