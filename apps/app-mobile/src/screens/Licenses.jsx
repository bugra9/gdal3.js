/* eslint-disable prettier/prettier */
import styled from 'styled-components/native';
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import libraries from '../libraries.js';

export default function LicensesScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    const LicensesView = libraries.map((lib) => (
        <LicenseListItem>
            <LicenseListItemTitle
                onPress={() => Linking.openURL(lib.homepage)}
            >
                ➤  {lib.name} {lib.version}
            </LicenseListItemTitle>
            <LicenseListItemSubtitle
                onPress={() => Linking.openURL(lib.license)}
            >
                License
            </LicenseListItemSubtitle>
        </LicenseListItem>
    ));

    return (
        <Container insets={insets}>
            <List>
                <ListItem>
                    <ListItemTitle>Compiled with</ListItemTitle>
                    <LicenseList>
                        {LicensesView}
                    </LicenseList>
                </ListItem>
            </List>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    padding-top: ${({ insets }) => insets.top || 0}px;
    background-color: white;
    padding: 20px;
`;

const LicenseList = styled.View`
    gap: 8px;
`;

const LicenseListItem = styled.View`
    flex-direction: row;
    align-items: flex-end;
    gap: 8px;
`;

const LicenseListItemTitle = styled.Text`
    font-size: 14px;
`;
const LicenseListItemSubtitle = styled.Text`
    font-size: 12px;
    color: #0089fa;
`;

const List = styled.View`
    gap: 12px;
    margin-top: 16px;
`;
const ListItem = styled.View`
    gap: 12px;
`;

const ListItemTitle = styled.Text`
    font-size: 14px;
    font-weight: bold;
`;
