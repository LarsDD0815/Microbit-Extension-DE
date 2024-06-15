namespace Robotter {

    //% block="Aktuelle Kompassausrichtung"
    //% group="Kompass"
    export function aktuelleKompassausrichtung(): number {

        const ausrichtung = calculateAverage(() => input.compassHeading());

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