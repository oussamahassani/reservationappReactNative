
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';

const SuccessModal = ({ visible, message, onClose }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animatable.View 
          animation="zoomIn"
          duration={500}
          style={styles.modalView}
        >
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            duration={1500}
            style={styles.successCircle}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animatable.View>
          
          <Text style={styles.modalText}>{message}</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: SPACING.lg,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: SPACING.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    color: COLORS.black,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md,
  },
});

export default SuccessModal;
