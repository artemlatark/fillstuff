import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Asset } from 'expo-asset';

import styles from './StubStyles';

const scanQrStudioInvitationStub = Asset.fromModule(require('mobile/assets/images/stubs/scan_qr_studio_invitation.png'));

function Stub(props) {
	const goToJoiningStudio = () => {
		props.navigation.navigate('JoiningStudio');
	};

	return (
		<View style={styles.stub}>
			<Image
				style={styles.stubImage}
				source={{
					uri: scanQrStudioInvitationStub.uri,
				}}
			/>
			<Text style={styles.stubTitle}>Вы&nbsp;не&nbsp;приглашены{'\n'}ни&nbsp;в&nbsp;одну студию</Text>
			<Text style={styles.stubSubhead}>Отсканируйте QR-код приглашения студии</Text>
			<Pressable
				onPress={() => goToJoiningStudio()}
				style={({ pressed }) => (pressed ? [styles.button, styles.buttonActive] : [styles.button])}
			>
				<Text style={styles.buttonText}>Сканировать QR-код</Text>
			</Pressable>
		</View>
	);
}

export default Stub;
