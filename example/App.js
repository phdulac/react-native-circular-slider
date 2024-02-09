export default function App() {
  const [value, setValue] = useState(50);
  return (
    <View style={styles.container}>
      <Text>{value}</Text>
      <CircularSlider
        startColor="#ff00ff"
        endColor="#ff0000"
        maxValue={100}
        minValue={0}
        value={value}
        onChange={setValue}
      />
    </View>
  );
}
