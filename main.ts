
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Räder', 'Servo', 'Kompass', 'Entferungssensor']"
namespace Robotter {

    const calculateAverage = (valueComputeFunction: () => number): number => {

        let sumOfValues = 0;
        for (let i = 0; i < 5; i++) {
            sumOfValues += valueComputeFunction();
        }

        return Math.round(sumOfValues / 5);
    }
}