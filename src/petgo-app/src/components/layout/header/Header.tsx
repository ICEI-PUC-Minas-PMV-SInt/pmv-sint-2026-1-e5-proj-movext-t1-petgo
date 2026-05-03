import { Image, Pressable, View } from "react-native";
import { Appbar } from "react-native-paper";
import PetGoLogo from "../../../../assets/images/petGo-logo.png";

export default function AppBar() {
  return (
    <Appbar.Header style={{ backgroundColor: "#4876A8", height: 80 }}>
      <Appbar.Content
        title={
          <View className="flex-row justify-center items-center w-full">
            <Pressable onPress={() => {}}>
              <Image
                source={PetGoLogo}
                className="w-48 h-20"
                resizeMode="contain"
              />
            </Pressable>
          </View>
        }
      />
    </Appbar.Header>
  );
}
