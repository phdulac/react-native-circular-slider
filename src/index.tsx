import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  View,
  type GestureResponderEvent,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const { height } = Dimensions.get("window");

const VIEWBOX = 400;

// Function to find the nearest point on a circle from a given point
function getNearestPointOnCircle(
  cx: number,
  cy: number,
  r: number,
  px: number,
  py: number
) {
  // Step 2: Calculate the vector from circle center to the given point
  let vx = px - cx;
  let vy = py - cy;

  // Step 3: Normalize the vector
  const length = Math.sqrt(vx * vx + vy * vy);
  vx /= length;
  vy /= length;

  // Step 4: Scale the normalized vector
  vx *= r;
  vy *= r;

  // Step 5: Add the scaled vector to the circle's center
  const nearestX = cx + vx;
  const nearestY = cy + vy;

  return { x: nearestX, y: nearestY };
}

function getAngleFromCenter(cx: number, cy: number, tx: number, ty: number) {
  // Calculate the difference between the target point and the center point
  const dx = tx - cx;
  const dy = ty - cy;

  // Use Math.atan2() to calculate the angle in radians
  // The angle is measured from the positive x-axis in a counterclockwise direction.
  const angleRad = Math.atan2(dy, dx);

  // Convert the angle from radians to degrees and adjust to be in the range [0, 360]
  let angleDeg = (angleRad * 180) / Math.PI - 90;
  if (angleDeg < 0) {
    angleDeg += 360;
  }

  return angleDeg;
}

function getCartesianPointFromAngle(
  centerX: number,
  centerY: number,
  radius: number,
  angleDeg: number
) {
  // Convert the angle from degrees to radians
  const angleRad = ((angleDeg + 90) * Math.PI) / 180;

  // Calculate the x and y coordinates based on the angle and radius
  const x = centerX + radius * Math.cos(angleRad);
  const y = centerY + radius * Math.sin(angleRad);

  return { x, y };
}

function convertDegreesToUnit(
  degreesValue: number,
  minUnitValue: number,
  maxUnitValue: number
) {
  // Calculate the number of full rotations made by the slider
  const fullRotations = Math.floor(degreesValue / 360);

  // Calculate the remaining degrees after accounting for full rotations
  const remainingDegrees = degreesValue % 360;

  // Calculate the ratio of the remaining degrees within the [0, 360] range
  const ratio = remainingDegrees / 360;

  // Calculate the corresponding value in the new unit range
  const unitValue =
    minUnitValue +
    fullRotations * (maxUnitValue - minUnitValue) +
    ratio * (maxUnitValue - minUnitValue);

  return unitValue;
}

function convertUnitToDegrees(
  unitValue: number,
  minUnitValue: number,
  maxUnitValue: number
) {
  // Calculate the range of the new unit
  const unitRange = maxUnitValue - minUnitValue;

  // Calculate the number of full rotations made by the slider
  const fullRotations = Math.floor((unitValue - minUnitValue) / unitRange);

  // Calculate the remaining value after accounting for full rotations
  const remainingValue = (unitValue - minUnitValue) % unitRange;

  // Calculate the corresponding angle in degrees
  const degreesValue = fullRotations * 360 + (remainingValue / unitRange) * 360;

  return degreesValue;
}

const convertUnitToCartesianPoint = (
  unitValue: number,
  minUnitValue: number,
  maxUnitValue: number,
  centerX: number,
  centerY: number,
  radius: number
) => {
  // Convert the unit to degrees
  const degreesValue = convertUnitToDegrees(
    unitValue,
    minUnitValue,
    maxUnitValue
  );

  // Convert the angle to a cartesian point
  const point = getCartesianPointFromAngle(
    centerX,
    centerY,
    radius,
    degreesValue
  );

  return point;
};

const convertCartesianPointToUnit = (
  point: { x: number; y: number },
  centerX: number,
  centerY: number,
  minUnitValue: number,
  maxUnitValue: number
) => {
  // Convert the cartesian point to an angle
  const degreesValue = getAngleFromCenter(centerX, centerY, point.x, point.y);

  // Convert the angle to a unit value
  const unitValue = convertDegreesToUnit(
    degreesValue,
    minUnitValue,
    maxUnitValue
  );

  return unitValue;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Circular slider to show in room and device view. It is used to set the temperature in manual mode
 */
const CircularSlider = ({
  onUpdate,
  value,
  minValue = 0,
  maxValue = 100,
  startColor,
  endColor,
  circleStroke = 13,
  circleRadius = 150,
}: {
  onUpdate: (t: number) => void;
  value: number;
  minValue?: number;
  maxValue?: number;
  circleStroke?: number;
  circleRadius?: number;
  startColor: string;
  endColor: string;
}) => {
  const centerPoint = { x: VIEWBOX / 2, y: VIEWBOX / 2 };
  const circleRef = useRef<Circle>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [temperature, setTemperature] = useState(0);

  // If state change from outside, update the position
  useEffect(() => {
    if (value === undefined || isNaN(value)) return;
    const _pos = convertUnitToCartesianPoint(
      value,
      minValue,
      maxValue,
      centerPoint.x,
      centerPoint.y,
      circleRadius - circleStroke
    );
    setPosition(_pos);
    setTemperature(value);
    animation.current.setValue(_pos);
  }, []);

  const animation = useRef(new Animated.ValueXY(position));

  // When position change due to user interaction, update the temperature
  useEffect(() => {
    setTemperature(() => {
      const t = convertCartesianPointToUnit(
        position,
        centerPoint.x,
        centerPoint.y,
        minValue,
        maxValue
      );
      onUpdate(t);
      return t;
    });
  }, [position]);

  const slide = (event: GestureResponderEvent) => {
    event.persist();
    event?.nativeEvent &&
      event.nativeEvent?.locationX &&
      event.nativeEvent?.locationY &&
      setPosition((prev) => {
        const _pos = (() => {
          const point = getNearestPointOnCircle(
            centerPoint.x,
            centerPoint.y,
            circleRadius - circleStroke,
            event.nativeEvent?.locationX,
            event.nativeEvent?.locationY
          );
          const futureValue = convertCartesianPointToUnit(
            point,
            centerPoint.x,
            centerPoint.y,
            minValue,
            maxValue
          );
          if (temperature >= maxValue - 0.1) {
            if (futureValue < maxValue && futureValue > maxValue - 0.5) {
              return point;
            } else {
              return prev;
            }
          } else if (temperature <= minValue + 0.1) {
            if (futureValue > minValue && futureValue < minValue + 0.5) {
              return point;
            } else {
              return prev;
            }
          } else {
            return point;
          }
        })();

        animation.current.setValue(_pos);
        return _pos;
      });
    return true;
  };

  return (
    <View
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        width: Math.min(height / 2.2, 400),
        height: Math.min(height / 2.2, 400),
      }}
    >
      <Svg
        style={{
          position: "absolute",
        }}
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      >
        <Defs>
          <LinearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </LinearGradient>
        </Defs>

        <Circle
          id="path"
          ref={circleRef}
          fill="url(#linear)"
          cx={centerPoint?.x}
          cy={centerPoint?.y}
          r={circleRadius}
        />

        <Circle
          id="path"
          ref={circleRef}
          fill="white"
          cx={centerPoint?.x}
          cy={centerPoint?.y}
          r={circleRadius - circleStroke * 2}
        />

        <AnimatedCircle
          testID={"animated-circle"}
          r={circleStroke - 1}
          strokeWidth={4}
          fill="white"
          id="circ"
          cx={animation?.current?.x}
          cy={animation?.current?.y}
          onMoveShouldSetResponder={() => true}
          onResponderMove={slide}
        />
      </Svg>
    </View>
  );
};

export default CircularSlider;
