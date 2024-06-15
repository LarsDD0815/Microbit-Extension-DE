
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Räder', 'Servo', 'Kompass', 'Entferungssensor']"
namespace Robotter {

    const calculateAverage = (valueComputeFunction: () => number): number => {
        const values: number[] = [];

        for (let i = 0; i < 10; i++) {
            values[i] = valueComputeFunction();
        }

        let sumOfValues = 0;

        values.forEach((value: number) => sumOfValues += value);

        return Math.round(sumOfValues / values.length);
    }
}