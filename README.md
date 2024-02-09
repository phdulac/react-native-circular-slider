# @phdulac/react-native-circular-slider
![image](https://github.com/phdulac/react-native-circular-slider/assets/8428095/b755b0bf-2da7-466f-aa12-9071cb905002)
![image](https://github.com/phdulac/react-native-circular-slider/assets/8428095/ad46fdc8-3f7a-46bc-998c-dfce7c4e7719)



A circular slider component for React Native that allows users to select a value by dragging a thumb along a circular track.

## Installation

Install the package using npm:

```bash
npm install @phdulac/react-native-circular-slider
```

## Usage
Here is a basic example of how to use the CircularSlider component:
    
```javascript
import React from 'react';
import CircularSlider from '@phdulac/react-native-circular-slider';

function MyComponent() {
  const [value, setValue] = React.useState(0);

  const handleUpdate = (newValue) => {
    setValue(newValue);
  };

  return (
    <CircularSlider
      value={value}
      onUpdate={handleUpdate}
      minValue={0}
      maxValue={100}
    />
  );
}

export default MyComponent;
```

In this example, the CircularSlider component is controlled by the value state variable. The onUpdate prop is a function that is called whenever the user changes the value of the slider.

## Props
The CircularSlider component accepts the following props:

- onUpdate: A function that is called whenever the user changes the value of the slider.
- value: The current value of the slider.
- minValue: The minimum value that the slider can have. Defaults to 0.
- maxValue: The maximum value that the slider can have. Defaults to 100.
- trackStyle: An object that defines the style of the track. It can have the following   properties:
  - backgroundColor: The background color of the track. Defaults to 'transparent'.
  - backgroundGradient: An array of two colors that define a gradient for the track. Defaults to ['#d3d3d3', '#e24EF5'].
  - width: The width of the track. Defaults to 15.
 - thumbStyle: An object that defines the style of the thumb. It can have the following properties:
  - backgroundColor: The background color of the thumb. Defaults to 'white'.
  - size: The size of the thumb. Defaults to 20.
  
  
  
  
  
License
MIT

