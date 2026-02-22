import React, { useState, useRef, useContext } from 'react';
import { ActivityIndicator, Linking, Platform, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import URL from '../utils/URL';

import style from '../Style';
import { AppContext } from '../utils/DeviceUtils';

const entrypoints = {
	ent: 'https://ent.u-bordeaux.fr',
	email: 'https://webmel.u-bordeaux.fr',
	cas: 'https://cas.u-bordeaux.fr',
	apogee: 'https://apogee.u-bordeaux.fr',
};

export default function WebBrowser({ navigation, route }) {
	const { themeName } = useContext(AppContext);
	const webViewRef = useRef(null);

	// Détermination de l'URL initiale
	let initialUri = URL.UKIT_WEBSITE;
	if (route.params) {
		const { entrypoint, href } = route.params;
		if (entrypoint && entrypoints[entrypoint]) {
			initialUri = entrypoints[entrypoint];
		} else if (href) {
			initialUri = href;
		}
	}

	// Gestion des états
	const [uri] = useState(initialUri);
	const [url, setUrl] = useState(initialUri);
	const [canGoBack, setCanGoBack] = useState(false);
	const [canGoForward, setCanGoForward] = useState(false);
	const [loading, setLoading] = useState(true);

	const onRefresh = () => {
		if (webViewRef.current) webViewRef.current.reload();
	};

	const onBack = () => {
		if (webViewRef.current) webViewRef.current.goBack();
	};

	const onForward = () => {
		if (webViewRef.current) webViewRef.current.goForward();
	};

	const openURL = async () => {
		try {
			const supported = await Linking.canOpenURL(url);
			if (!supported) {
				console.warn("Can't handle url: " + url);
			} else {
				await Linking.openURL(url);
			}
		} catch (err) {
			console.error('An error occurred', err);
		}
	};

	const renderLoading = () => {
		const theme = style.Theme[themeName];
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					backgroundColor: theme.greyBackground,
				}}>
				<ActivityIndicator size="large" color={theme.iconColor} />
			</View>
		);
	};

	if (!uri) {
		return renderLoading();
	}

	const theme = style.Theme[themeName];
	const javascript = Platform.OS !== 'ios' ? 'window.scrollTo(0,0);' : null;

	return (
		<SafeAreaView
			style={{ flex: 1, flexDirection: 'column', backgroundColor: theme.background }}>
			<WebView
				ref={webViewRef}
				javaScriptEnabled={true}
				domStorageEnabled={true}
				startInLoadingState={true}
				renderLoading={renderLoading}
				injectedJavaScript={javascript}
				onNavigationStateChange={(e) => {
					if (!e.loading) {
						setUrl(e.url);
						setCanGoBack(e.canGoBack);
						setCanGoForward(e.canGoForward);
						setLoading(e.loading);
						
						if (e.title) {
							navigation.setParams({ title: e.title });
						}
					}
				}}
				source={{ uri }}
			/>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingHorizontal: 10,
					paddingVertical: 5,
					backgroundColor: theme.background,
				}}>
				<TouchableOpacity disabled={!canGoBack} onPress={onBack}>
					<MaterialIcons
						name="navigate-before"
						size={30}
						style={{
							color: canGoBack ? theme.icon : 'grey',
							height: 30,
							width: 30,
						}}
					/>
				</TouchableOpacity>
				<TouchableOpacity disabled={!canGoForward} onPress={onForward}>
					<MaterialIcons
						name="navigate-next"
						size={30}
						style={{
							color: canGoForward ? theme.icon : 'grey',
							height: 30,
							width: 30,
						}}
					/>
				</TouchableOpacity>

				<TouchableOpacity disabled={loading} onPress={onRefresh}>
					<MaterialIcons
						name="refresh"
						size={30}
						style={{
							color: loading ? 'grey' : theme.icon,
							height: 30,
							width: 30,
						}}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={openURL}
					style={{
						paddingRight: 16,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<View>
						{Platform.OS === 'ios' ? (
							<MaterialCommunityIcons
								name="apple-safari"
								size={25}
								style={{ color: theme.icon, height: 25, width: 25 }}
							/>
						) : (
							<MaterialCommunityIcons
								name="google-chrome"
								size={25}
								style={{ color: theme.icon, height: 25, width: 25 }}
							/>
						)}
					</View>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}