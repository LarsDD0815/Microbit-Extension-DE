/**
 * use for RGB-LED
 */
enum COLOR {
    //% block=rot
    red,
    //% block=grün
    green,
    //% block=blau
    blue,
    //% block=weiß
    white,
    //% block=schwarz
    black
}
/**
  * Pre-Defined LED colours
  */
enum vColors {
    //% block=rot
    Red = 0xff0000,
    //% block=orange
    Orange = 0xffa500,
    //% block=gelb
    Yellow = 0xffff00,
    //% block=grün
    Green = 0x00ff00,
    //% block=blau
    Blue = 0x0000ff,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violett
    Violet = 0x8a2be2,
    //% block=lila
    Purple = 0xff00ff,
    //% block=weiß
    White = 0xffffff,
    //% block=schwarz
    Black = 0x000000
}
/**
 * use for control motor
 */
enum DIR {
    //% block="vorwärts"
    Run_forward = 0,
    //% block="rückwärts"
    Run_back = 1,
    //% block="nach links"
    Turn_Left = 2,
    //% block="nach rechts"
    Turn_Right = 3
}
enum LR {
    //% block="vorne links"
    Upper_left = 0,
    //% block="hinten links"
    Lower_left = 1,
    //% block="vorne rechts"
    Upper_right = 2,
    //% block="hinten rechts"
    Lower_right = 3,
}
enum MotorState {
    //% block=stop
    stop = 0,
    //% block=start
    brake = 1
}
enum MD {
    //% block="vorwärts"
    Forward = 0,
    //% block="rückwärts"
    Back = 1
}

enum LT {
    //% block="links"
    Left,
    //% block="mitte"
    Center,
    //% block="rechts"
    Right
    
}

enum LEDID {
    //% block="links"
    Left = 0x09,
    //% block="rechts"
    Right = 0x0a
}

enum LedState {
    //% block="an"
    ON = 4095,
    //% block="aus"
    OFF = 0
}

enum Servo_num {
    D14,
    D15
}

//% color="#ff6800" icon="\uf1b9" weight=15
//% groups="['Motor', 'Servo', 'led', 'Neo-pixel', 'Sensor', 'Tone']"
namespace mecanumRobotV2 {
    /**
     * use for control PCA9685
     */
    export enum Servos {
        D14 = 14,
        D15 = 15
    }

    const STC15_ADDRESS = 0x30;   //device address

    function i2cWrite(STC15_ADDRESS: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(STC15_ADDRESS, buf)
    }


    /**
     * Motor Geschwindigkeit einstellen
     */
    //% block="Vorne Links $D mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorVorneLinks(M: LR, D: MD, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (D == 0) {
            i2cWrite(0x30, 0x03, 0); //M2A
            i2cWrite(0x30, 0x04, speed_value); //M2B
        } else if (D == 1) {
            i2cWrite(0x30, 0x03, speed_value); //M2A
            i2cWrite(0x30, 0x04, 0); //M2B
        }
    }

    /**
     * Motor Geschwindigkeit einstellen
     */
    //% block="Vorne Rechts $D mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorVorneRechts(M: LR, D: MD, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (D == 0) {
            i2cWrite(0x30, 0x03, 0); //M2A
            i2cWrite(0x30, 0x04, speed_value); //M2B
        } else if (D == 1) {
            i2cWrite(0x30, 0x03, speed_value); //M2A
            i2cWrite(0x30, 0x04, 0); //M2B
        }
    }

    /**
     * Motor Geschwindigkeit einstellen
     */
    //% block="Vorne Rechts $D mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorHintenLinks(M: LR, D: MD, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (D == 0) {
            i2cWrite(0x30, 0x07, 0); //M2A
            i2cWrite(0x30, 0x08, speed_value); //M2B
        } else if (D == 1) {
            i2cWrite(0x30, 0x07, speed_value); //M2A
            i2cWrite(0x30, 0x08, 0); //M2B
        }
    }

    /**
     * Motor Geschwindigkeit einstellen
     */
    //% block="Vorne Rechts $D mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function MotorHintenRechts(M: LR, D: MD, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        if (D == 0) {
            i2cWrite(0x30, 0x05, 0); //M2A
            i2cWrite(0x30, 0x06, speed_value); //M2B
        } else if (D == 1) {
            i2cWrite(0x30, 0x05, speed_value); //M2A
            i2cWrite(0x30, 0x06, 0); //M2B
        }
    }

    /**
     * Motor Geschwindigkeit einstellen
     */
    //% block="Stelle Motor $M $D mit Geschwindigkeit: $speed \\%"
    //% speed.min=0 speed.max=100
    //% group="Motor" weight=97
    export function Motor(M: LR, D: MD, speed: number) {

        let speed_value = Math.map(speed, 0, 100, 0, 255);
        //电机1
        //正转
        if (M == 2 && D == 1) {
            i2cWrite(0x30, 0x01, speed_value); //M1A
            i2cWrite(0x30, 0x02, 0); //M1B
        }
        //反转
        if (M == 2 && D == 0) {
            i2cWrite(0x30, 0x01, 0); //M1A
            i2cWrite(0x30, 0x02, speed_value); //M1B
        }

        //电机2
        if (M == 0 && D == 0) {
            i2cWrite(0x30, 0x03, 0); //M2A
            i2cWrite(0x30, 0x04, speed_value); //M2B
        }
        if (M == 0 && D == 1) {
            i2cWrite(0x30, 0x03, speed_value); //M2A
            i2cWrite(0x30, 0x04, 0); //M2B
        }
        //电机3
        if (M == 3 && D == 1) {
            i2cWrite(0x30, 0x05, speed_value); //M3A
            i2cWrite(0x30, 0x06, 0); //M3B
        }
        if (M == 3 && D == 0) {
            i2cWrite(0x30, 0x05, 0); //M3A
            i2cWrite(0x30, 0x06, speed_value); //M3B
        }
        //电机4
        if (M == 1 && D == 0) {
            i2cWrite(0x30, 0x07, 0); //M4A
            i2cWrite(0x30, 0x08, speed_value); //M4B
        }
        if (M == 1 && D == 1) {
            i2cWrite(0x30, 0x07, speed_value); //M4A
            i2cWrite(0x30, 0x08, 0); //M4B
        }

    }


    /**
     * Motor stoppen
     */
    //% block="Auto anhalten"
    //% group="Motor" weight=98
    export function state() {
        //if (!PCA9685_Initialized) {
        //init_PCA9685();
        //}

        //stop
        i2cWrite(0x30, 0x01, 0); //M1A
        i2cWrite(0x30, 0x02, 0); //M1B
        i2cWrite(0x30, 0x03, 0); //M1A
        i2cWrite(0x30, 0x04, 0); //M1B
        i2cWrite(0x30, 0x05, 0); //M1A
        i2cWrite(0x30, 0x06, 0); //M1B
        i2cWrite(0x30, 0x07, 0); //M1A
        i2cWrite(0x30, 0x08, 0); //M1B
    }


    /**
     * Lichter ein-/auschalten
     */
    //% block="LED $LEDID $LedS"
    //% group="led" weight=76
    export function setLed(LEDID: LEDID, LedS: LedState) {
        i2cWrite(0x30, LEDID, LedS);
    }

    /**
    * Servo einstellen
    */
    //% block="Server auf Winkel %angle einstellen"
    //% group="Servo" weight=70
    //% angle.min=-90 angle.max.max=90
    export function setServo(angle: number): void {
        pins.servoWritePin(AnalogPin.P14, angle)
    }


    /**
    * Linienverfolgung
    */
    /////////////////////////////////////////////////////
    //% block="$LT_val Linie verfolgen"
    //% group="Sensor" weight=69
    export function LineTracking(LT_val: LT) {
        let val = 0;
        let lt = LT_val;
        switch (lt) {
            case LT.Left:
                val = pins.digitalReadPin(DigitalPin.P3);
                break;
            case LT.Right:
                val = pins.digitalReadPin(DigitalPin.P10);
                break;
            case LT.Center:
                val = pins.digitalReadPin(DigitalPin.P4);
                break;
        }
        // val = (pins.digitalReadPin(DigitalPin.P14)<<2) + 
        //       (pins.digitalReadPin(DigitalPin.P15)<<1) +
        //       (pins.digitalReadPin(DigitalPin.P16));
        return val;
    }
    /**
     * Ultraschallsensor
     */
    let lastTime = 0;
    //% block="Ultraschallsensor"
    //% group="Sensor" weight=68
    export function ultra(): number {
        //send trig pulse
        pins.setPull(DigitalPin.P15, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P15, 0)
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P15, 1)
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P15, 0)

        // read echo pulse  max distance : 6m(35000us)  
        let t = pins.pulseIn(DigitalPin.P16, PulseValue.High, 35000);
        let ret = t;

        //Eliminate the occasional bad data
        if (ret == 0 && lastTime != 0) {
            ret = lastTime;
        }
        lastTime = t;

        return Math.round(ret / 58);
    }

}
