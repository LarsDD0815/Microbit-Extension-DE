
//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Räder', 'Servo', 'Kompass', 'Entferungssensor']"
namespace Robotter {

    const calculateAverage = (valueComputeFunction: () => number): number => {
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

    const filterOutliers = (initialArray: number[]): number[] => {
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