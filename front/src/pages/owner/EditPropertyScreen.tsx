
// Import Slider from @react-native-community/slider instead of react-native
import Slider from '@react-native-community/slider';

// Fix the implicit any types
const renderWorkstationsSlider = () => (
  <View style={styles.sliderContainer}>
    <Text style={styles.sliderLabel}>Nombre de postes de travail: {workstations}</Text>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={50}
      step={1}
      value={workstations}
      onValueChange={(value: number) => setWorkstations(value)}
      minimumTrackTintColor={COLORS.primary}
      maximumTrackTintColor="#D3D3D3"
      thumbTintColor={COLORS.primary}
    />
  </View>
);

const renderMeetingRoomsSlider = () => (
  <View style={styles.sliderContainer}>
    <Text style={styles.sliderLabel}>Nombre de salles de réunion: {meetingRooms}</Text>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={20}
      step={1}
      value={meetingRooms}
      onValueChange={(value: number) => setMeetingRooms(value)}
      minimumTrackTintColor={COLORS.primary}
      maximumTrackTintColor="#D3D3D3"
      thumbTintColor={COLORS.primary}
    />
  </View>
);

const renderPrivateOfficesSlider = () => (
  <View style={styles.sliderContainer}>
    <Text style={styles.sliderLabel}>Nombre de bureaux privés: {privateOffices}</Text>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={20}
      step={1}
      value={privateOffices}
      onValueChange={(value: number) => setPrivateOffices(value)}
      minimumTrackTintColor={COLORS.primary}
      maximumTrackTintColor="#D3D3D3"
      thumbTintColor={COLORS.primary}
    />
  </View>
);
