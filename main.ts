
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Räder', 'Servo', 'Kompass', 'Entferungssensor']"
namespace Robotter {

    const calculateAverage = (valueComputeFunction: () => number): number => {
        const values: number[] = [];

        for (let i = 0; i < 5; i++) {
            values[i] = valueComputeFunction();
        }

        const sumOfValues = values.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0)

        return Math.round(sumOfValues / values.length);
    }
}