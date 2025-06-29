type UnitCategory = 'length' | 'mass' | 'temperature';
type Unit = string;

export const unitCategories: Record<UnitCategory, Unit[]> = {
  length: ['meters', 'kilometers', 'miles', 'feet'],
  mass: ['grams', 'kilograms', 'pounds'],
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
};

type ConverterFunction = (value: number) => number;
type Converters = Record<string, ConverterFunction>;

export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;

  const converters: Converters = {
    // Length
    'meters:kilometers': (v) => v / 1000,
    'kilometers:meters': (v) => v * 1000,
    'meters:miles': (v) => v * 0.000621371,
    'miles:meters': (v) => v / 0.000621371,
    'meters:feet': (v) => v * 3.28084,
    'feet:meters': (v) => v / 3.28084,
    'kilometers:miles': (v) => v * 0.621371,
    'miles:kilometers': (v) => v / 0.621371,
    'kilometers:feet': (v) => v * 3280.84,
    'feet:kilometers': (v) => v / 3280.84,
    'miles:feet': (v) => v * 5280,
    'feet:miles': (v) => v / 5280,

    // Mass
    'grams:kilograms': (v) => v / 1000,
    'kilograms:grams': (v) => v * 1000,
    'grams:pounds': (v) => v * 0.00220462,
    'pounds:grams': (v) => v / 0.00220462,
    'kilograms:pounds': (v) => v * 2.20462,
    'pounds:kilograms': (v) => v / 2.20462,

    // Temperature
    'celsius:fahrenheit': (v) => (v * 9) / 5 + 32,
    'fahrenheit:celsius': (v) => ((v - 32) * 5) / 9,
    'celsius:kelvin': (v) => v + 273.15,
    'kelvin:celsius': (v) => v - 273.15,
    'fahrenheit:kelvin': (v) => ((v - 32) * 5) / 9 + 273.15,
    'kelvin:fahrenheit': (v) => ((v - 273.15) * 9) / 5 + 32,
  };

  const key = `${from}:${to}`;
  return converters[key] ? converters[key](value) : NaN;
}