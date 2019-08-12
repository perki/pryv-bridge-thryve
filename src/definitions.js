
const logger = require('./logging');

exports.sources = ["Dummy","Fitbit","Garmin","Polar","Apple","Samsung","Misfit","Withings","Thryve Connector","Thryve Wearable Connector","Strava","GoogleFit REST","Xiaomi","MyFitnessPal","Runtastic","Omron","Suunto","Oura","Runkeeper","Endomondo","iHealth","Abbott(FreeStyleLibre)","Medisana","Sleep As Android"];

const dataTypesCSV = ["1000;Steps;Daily;sum of steps;LONG;count/steps",
  "1000;Steps;Intraday;sum of steps (in this minute);LONG;count/steps",
  "1001;CoveredDistance;Daily;covered distance in meters;LONG;length/m",
  "1001;CoveredDistance;Intraday;covered distance in meters (in this minute);LONG;length/m",
  "1002;FloorsClimbed;Daily;number of staircase floors climbed;LONG;count/generic",
  "1002;FloorsClimbed;Intraday;number of staircase floors climbed (in this minute);LONG;count/unit",
  "1003;ElevationGain;Daily;elevation gain in meters;DOUBLE;length/m",
  "1003;ElevationGain;Intraday;elevation gain in meters (in this minute);DOUBLE;length/m",
  "1010;BurnedCalories;Daily;estimation of kilo calories burned per day;LONG;energy/kcal",
  "1010;BurnedCalories;Intraday;estimation of burned kilo calories (in this minute), comprising basic and activity induced calories consumption;LONG;energy/kcal",
  "1011;ActiveBurnedCalories;Daily;estimation of additional kilo calories burned during activities;LONG;energy/kcal",
  "1011;ActiveBurnedCalories;Intraday;the part of burned kilo calories, that is induced by activity (in this minute) - in contrast to basic calory consumption;LONG;energy/kcal",
  "1012;MetabolicEquivalent;Daily;ratio of the rate at which a person expends energy to the person's mass;DOUBLE;todo",
  "1012;MetabolicEquivalent;Intraday;ratio of the rate at which a person expends energy to the person's mass (in this minute);DOUBLE;todo",
  "1013;PhysicalActivityIndex;Daily;PA index;DOUBLE;todo",
  "1013;PhysicalActivityIndex;Daily;PA index;DOUBLE;todo",
  "1100;ActivityDuration;Daily;overall sum of active minutes (all recorded activitites other than sleep, rest, charge, doffed);LONG;todo",
  "1101;ActivityLowDuration;Daily;sum of minutes spent with light activity;LONG;todo",
  "1101;ActivityLowBinary;Intraday;low Activity detected (in this minute);BOOLEAN;ignore",
  "1102;ActivityMidDuration;Daily;sum of minutes spent with medium activity;LONG;todo",
  "1102;ActivityMidBinary;Intraday;medium Activity detected (in this minute);BOOLEAN;todo",
  "1103;ActivityHighDuration;Daily;sum of minutes spent with high activity;LONG;todo",
  "1103;ActivityHighBinary;Intraday;high Activity detected (in this minute);BOOLEAN;todo",
  "1104;ActivitySedentaryDuration;Daily;sum of minutes spent sedentary;LONG;todo",
  "1104;ActivitySedentaryBinary;Intraday;sedentary Activity detected (in this minute);BOOLEAN;todo",
  "1110;ChargeDuration;Daily;sum of minutes spent charging;LONG;ignore",
  "1110;ChargeBinary;Intraday;charge detected (in this minute);BOOLEAN;todo",
  "1111;DoffedDuration;Daily;sum of minutes spent doffed;LONG;todo",
  "1111;DoffedBinary;Intraday;device not worn (in this minute);BOOLEAN;todo",
  "1112;SleepDuration;Daily;sum of minutes spent sleeping;LONG;time/min",
  "1112;SleepBinary;Intraday;sleep detected (in this minute);BOOLEAN;todo",
  "1113;RestDuration;Daily;sum of minutes spent resting;LONG;todo",
  "1113;RestBinary;Intraday;rest detected (in this minute);BOOLEAN;ignore",
  "1114;ActiveDuration;Daily;sum of minutes spent in a generically active state;LONG;todo",
  "1114;ActiveBinary;Intraday;generic activity detected (in this minute);NONE;activity/plain",
  "1115;WalkDuration;Daily;sum of minutes spent walking;LONG;todo",
  "1115;WalkBinary;Intraday;walk detected (in this minute);BOOLEAN;ignore",
  "1116;RunDuration;Daily;sum of minutes spent running;LONG;todo",
  "1116;RunBinary;Intraday;run detected (in this minute);BOOLEAN;ignore",
  "1117;BikeDuration;Daily;sum of minutes spent biking;LONG;todo",
  "1117;BikeBinary;Intraday;biking detected (in this minute);BOOLEAN;todo",
  "1118;TransportDuration;Daily;sum of minutes spent in car or transport vehicle;LONG;todo",
  "1118;TransportBinary;Intraday;transport detected (in this minute);BOOLEAN;ignore",
  "1119;SittingBinary;Intraday;sitting detected (in this minute);BOOLEAN;todo",
  "1200;ActivityType;Intraday;ID of the broad activity category;ACT-1;ignore",
  "1201;ActivityTypeDetail1;Intraday;ID of the specific activity category;LONG;todo",
  "1202;ActivityTypeDetail2;Intraday;ID of the very specific activity category;LONG;todo",
  "1401;GeolocationLatitude;Intraday;ZZZ;LONG;ignore",
  "1402;GeolocationLongitude;Intraday;ZZZ;LONG;ignore",
  "1501;UnsteadyHighActivity;Daily;list of times at which the user is most likely to act on activity promotion messages;STRING;todo",
  "2000;SleepDuration;Daily;overall sleep duration without wake times in minutes;LONG;todo",
  "2000;SleepDuration;Daily;overall sleep duration without wake times in minutes;LONG;todo",
  "2000;SleepStateBinary;Intraday;sleep detected (in this minute);BOOLEAN;todo",
  "2000;SleepStateBinary;Intraday;sleep detected (in this minute);BOOLEAN;todo",
  "2001;SleepInBedDuration;Daily;overall sleep duration with wake times in minutes;LONG;todo",
  "2001;SleepInBedBinary;Intraday;;BOOLEAN;todo",
  "2002;SleepREMDuration;Daily;overall time spent in REM sleep in minutes;LONG;todo",
  "2002;SleepREMBinary;Intraday;overall time spent in REM sleep in minutes;BOOLEAN;todo",
  "2003;SleepDeepDuration;Daily;overall time spent in deep sleep in minutes;LONG;todo",
  "2003;SleepDeepBinary;Intraday;deep sleep detected (in this minute);BOOLEAN;todo",
  "2004;SleepMidDuration;Daily;overall time spent in medium sleep in minutes;LONG;todo",
  "2004;SleepMidBinary;Intraday;medium sleep detected (in this minute);BOOLEAN;todo",
  "2005;SleepLightDuration;Daily;overall time spent in light sleep in minutes;LONG;todo",
  "2005;SleepLightBinary;Intraday;light sleep detected (in this minute);BOOLEAN;todo",
  "2006;SleepAwakeDuration;Daily;overall time awake during sleep periods in minutes;LONG;todo",
  "2006;SleepAwakeBinary;Intraday;sleep interruption detected (in this minute);BOOLEAN;todo",
  "2007;SleepLatency;Daily;sleep onset latency in minutes;LONG;todo",
  "2007;SleepLatencyBinary;Intraday;sleep onset phase detected (in this minute);BOOLEAN;todo",
  "2008;SleepAwakeAfterWakeup;Daily;sum of minutes spent in bed after waking up;LONG;todo",
  "2100;SleepStartTime;Daily;first sleep onset ;DATE;todo",
  "2101;SleepEndTime;Daily;last wake-up ;DATE;todo",
  "2102;SleepInterruptions;Daily;number of sleep interruptions;LONG;todo",
  "2103;SleepTurns;Daily;number of nightly turns;LONG;todo",
  "2103;SleepTurns;Intraday;detected turns (in this minute);LONG;todo",
  "2200;SleepEfficiency;Daily;sleep efficiency in percentage;LONG;todo",
  "2201;SleepQuality;Daily;;LONG;todo",
  "2201;SleepLinearAnalysis;Daily;Multiple regression of steps, MET and SleepStartTime on Sleep Quality over the last 3 month;LINEAR-ANALYSIS;todo",
  "2201;SleepQuality;Daily;;LONG;todo",
  "2202;SleepLikelyhoodHeatmap;Daily;Heatmap in hourly resolution showing the likelyhood to be asleep for every weekday;HEATMAP;todo",
  "2202;SleepLikelyhoodHeatmap;Daily;Heatmap in hourly resolution showing the likelyhood to be asleep for every weekday;HEATMAP;todo",
  "2203;SleepDeviationHeatmap;Daily;Heatmap in hourly resolution showing the standard deviation of sleep likelyhood for every weekday;HEATMAP;todo",
  "2210;SleepIntensity;Daily;average sleep intensity;DOUBLE;todo",
  "2210;SleepIntensity;Intraday;sleep intensity (in this minute);DOUBLE;todo",
  "2220;SleepRegularity;Daily;Established Indicator describing the likelihood that any two time-points 24 hours apart were the same sleep/wake state, across all days.;LONG;todo",
  "2220;SleepRegularity;Daily;Established Indicator describing the likelihood that any two time-points 24 hours apart were the same sleep/wake state, across all days.;LONG;todo",
  "3000;HeartRate;Daily;average heart rate;LONG;todo",
  "3000;HeartRate;Intraday;heart rate detected (in this minute);LONG;todo",
  "3001;HeartRateResting;Daily;average resting heart rate;LONG;todo",
  "3001;PulseWaveVelocity;Intraday;PulseWave Velocity detected (in this minute);DOUBLE;todo",
  "3002;HeartRateSleep;Daily;average nightly heart rate;LONG;todo",
  "3002;SPO2;Intraday;SPO2 detected (in this minute);DOUBLE;todo",
  "3029;HeartRateIntervals;Intraday;Comma-seperated array of RR-intervals;STRING;todo",
  "3030;VO2max;Daily;maximum cardiovascular oxygen intake in mol per minute and kilogram of body weight;DOUBLE;todo",
  "3030;VO2max;Daily;maximum cardiovascular oxygen intake in mol per minute and kilogram of body weight;DOUBLE;todo",
  "3030;VO2max;Intraday;maximum cardiovadcular oxygen intake in mol per minute and kilogram of body weight;DOUBLE;todo",
  "3030;VO2max;Intraday;maximum cardiovadcular oxygen intake in mol per minute and kilogram of body weight;DOUBLE;todo",
  "3031;FitnessAge;Daily;age-equivalent of cardiorespiratory fitness level;LONG;todo",
  "3032;VO2maxPercentile;Daily;percentile of VO2max in relation to age and gender specific overall population;LONG;todo",
  "3040;FraminghamRiskScore;Daily;Estimated individual risk for cardiovascular disease within 10 years;DOUBLE;todo",
  "3041;FatalCVDRiskSCORE;Daily;estimated individual risk for fatal cardiovascular disease within 10 years;DOUBLE;todo",
  "3042;ThryveFatalCVDRisk;Daily;estimated individual risk for fatal cardiovascular disease within 10 years adjusted for cardiovascular fitness;DOUBLE;todo",
  "3100;Rmssd;Daily;Average daily RMSSD (indicator of heart rate variability);DOUBLE;todo",
  "3100;Rmssd;Intraday;RMSSD detected (in this minute);DOUBLE;todo",
  "3120;AtrialFibrillationDetection;Daily;atrial fibrillation detected on this day;BOOLEAN;todo",
  "3120;AtrialFibrillationDetection;Intraday;atrial fibrillation detected in this minute;BOOLEAN;todo",
  "3302;BloodGlucose;Intraday;blood glucose content in mmol/L ;DOUBLE;todo",
  "3303;HbA1c;Daily;glycated hemoglobin HbA1c;DOUBLE;todo",
  "3303;HbA1c;Intraday;glycated hemoglobin HbA1c;DOUBLE;todo",
  "3304;MeanArterialPressure;Intraday;mean arterial pressure in mmHg;LONG;todo",
  "4000;RespirationRate;Daily;average respiration rate;LONG;todo",
  "4000;RespirationRate;Intraday;respiration rate (in this minute);LONG;todo",
  "4001;RespirationRateResting;Daily;average resting respiration rate;LONG;todo",
  "5010;AlcoholConsumption;Daily;estimation of alcohol consumption in percentage;LONG;todo",
  "5010;AlcoholConsumption;Daily;estimation of alcohol consumption in percentage;LONG;todo",
  "5020;Weight;Daily;weight in kilogram;LONG;todo",
  "5020;Weight;Intraday;weight in kilogram;LONG;todo",
  "5021;MuscleMass;Intraday;muscle mass in kilograms;LONG;todo",
  "5022;BoneMass;Intraday;bone mass in kilograms;LONG;todo",
  "5023;FatFreeMass;Intraday;fat free body mass in kilograms;LONG;todo",
  "5024;FatMass;Intraday;mass of body fat in kilograms;LONG;todo",
  "5025;FatRatio;Daily;fat ratio to total body mass in percent;LONG;todo",
  "5025;FatRatio;Intraday;fat ratio to total body mass in percent;LONG;todo",
  "5026;BMI;Daily;body mass indey;DOUBLE;todo",
  "5026;BMI;Intraday;body mass index;DOUBLE;todo",
  "5027;WaistCircumference;Daily;waist circumference in centimeters;LONG;todo",
  "5030;Height;Daily;height in centimeters;LONG;todo",
  "5030;Height;Intraday;height in centimeters;LONG;todo",
  "5040;BodyTemperature;Intraday;body temperature in degree celsius;DOUBLE;todo",
  "5041;SkinTemperature;Intraday;skin temperature in degree celsius;DOUBLE;todo",
  "5042;UndefinedTemperature;Intraday;temperature at undefined location in degree celsius;DOUBLE;todo",
  "5043;Hydration;Intraday;hydration level;DOUBLE;todo",
  "6010;AverageStress;Daily;average stress during the day (0-100);LONG;todo",
  "6011;HighStressDuration;Daily;overall time spent in very stressed state in minutes;LONG;todo",
  "6012;MediumStressDuration;Daily;overall time spent in medium stressed state in minutes;LONG;todo",
  "6013;LowStressDuration;Daily;overall time spent in lowly stressed state in minutes;LONG;todo",
  "8000;ConsumedCalories;Daily;Consumed calories in kcal;LONG;todo",
  "8000;ConsumedCalories;Intraday;Consumed calories in kcal;LONG;todo",
  "8001;ConsumedFat;Daily;nutritional intake of fat in g;DOUBLE;todo",
  "8001;ConsumedFat;Intraday;nutritional intake of fat in g;DOUBLE;todo",
  "8002;ConsumedSaturatedFat;Daily;nutritional intake of saturated fat in g;DOUBLE;todo",
  "8002;ConsumedSaturatedFat;Intraday;nutritional intake of saturated fat in g;DOUBLE;todo",
  "8003;ConsumedCarboHydrates;Daily;nutritional intake of carbohydrates in g;DOUBLE;todo",
  "8003;ConsumedCarboHydrates;Intraday;nutritional intake of carbohydrates in g;DOUBLE;todo",
  "8004;ConsumedSugar;Daily;nutritional intake of sugar in g;DOUBLE;todo",
  "8004;ConsumedSugar;Intraday;nutritional intake of sugar in g;DOUBLE;todo",
  "8005;ConsumedProtein;Daily;nutritional intake of protein in g;DOUBLE;todo",
  "8005;ConsumedProtein;Intraday;nutritional intake of protein in g;DOUBLE;todo",
  "8006;ConsumedSalt;Intraday;nutritional intake of salt in g;DOUBLE;todo",
  "8007;ConsumedSugarAlcohols;Intraday;nutritional intake of sugar alcohols in g;DOUBLE;todo",
  "8008;ConsumedStarch;Intraday;nutritional intake of starch in g;DOUBLE;todo",
  "8009;ConsumedFiber;Daily;nutritional intake of fiber in g;DOUBLE;todo",
  "8009;ConsumedFiber;Intraday;nutritional intake of fiber in g;DOUBLE;todo",
  "8010;ConsumedCalcium;Daily;nutritional intake of calcium in mg;DOUBLE;todo",
  "8010;ConsumedCalcium;Intraday;nutritional intake of calcium in mg;DOUBLE;todo",
  "8011;ConsumedIron;Daily;nutritional intake of iron in mg;DOUBLE;todo",
  "8011;ConsumedIron;Intraday;nutritional intake of iron in mg;DOUBLE;todo",
  "8012;ConsumedPotassium;Daily;nutritional intake of potassium in mg;DOUBLE;todo",
  "8012;ConsumedPotassium;Intraday;nutritional intake of potassium in mg;DOUBLE;todo",
  "8013;ConsumedSodium;Daily;nutritional intake of sodium in mg;DOUBLE;todo",
  "8013;ConsumedSodium;Intraday;nutritional intake of sodium in mg;DOUBLE;todo",
  "8023;ConsumedVitaminA;Daily;nutritional intake of vitamin A in mg;DOUBLE;todo",
  "8023;ConsumedVitaminA;Intraday;nutritional intake of vitamin A in mg;DOUBLE;todo",
  "8032;ConsumedVitaminC;Daily;nutritional intake of vitamin C in mg;DOUBLE;todo",
  "8032;ConsumedVitaminC;Intraday;nutritional intake of vitamin C in mg;DOUBLE;todo",
  "8033;ConsumedVitaminD;Intraday;nutritional intake of vitamin D in mg;DOUBLE;todo",
  "2201;SleepLinearAnalysis;Daily;Multiple regression of steps, MET and SleepStartTime on Sleep Quality over the last 3 month;LINEAR-ANALYSIS;todo"]


function toSnake(s) {
  return s.replace(/(?:^|\.?)([A-Z])/g, function (x, y) { 
    return "-" + y.toLowerCase() }).replace(/^_/, "").substring(1);
}

function toName(s) {
  return s.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
    return " " + y
  }).replace(/^_/, "").substring(1);
}

const converters = {
  'DOUBLE': function(data) {
    return Number(data.value);
  },
  'LONG': function (data) {
    return Number(data.value);
  },
  'NONE': function (data) {
    return null;
  },
  'BOOLEAN': function (data) {
    return data.value === 'true';
  },
  'ACT-1': function (data) {
    // TODO
  }

}

const dataTypes = {};
dataTypesCSV.map(function(line) {
  const sline = line.split(';');
  if (sline.length !== 6) { 
    logger.warn('Invalid line in dataTypes definitions: ' + line);
    return;
  }
  let hcode = null;
  if (sline[2] === 'Daily') hcode = 'd';
  if (sline[2] === 'Intraday') hcode = 'i';
  if (! hcode) {
    logger.warn('Invalid line in dataTypes definitions: ' + line);
    return;
  }

  const converter = converters[sline[4]];
  if (!converter) {
  //  logger.warn('Cannot find converter for definition: ' + line);
    return;
  }

  dataTypes[hcode + sline[0]] = {
    streamCode: toSnake(sline[1]),
    streamName: toName(sline[1]),
    type: sline[5],
    converter: converter
  }

});
exports.dataTypes = dataTypes;
