/* eslint-disable prettier/prettier */
import styled from 'styled-components/native';
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    return (
        <Container insets={insets}>
            <MainContainer>
                <TitleContainer>
                    <Title>gdal3.js</Title>
                    <Version>v3.0.0</Version>
                </TitleContainer>
                <Description>
                    gdal3.js Mobile is a React Native application that provides a gui to gdal_translate, ogr2ogr and gdal_rasterize applications. Uses gdal3.js in the background. It runs on the device and files are converted on the client side.
                </Description>
                <Description>
                    gdal3.js is a port of Gdal applications to iOS, Android and Webassembly. It allows you to convert raster and vector geospatial data to various formats and coordinate systems.
                </Description>
                <Description>
                    gdal3.js uses cpp.js to compile Gdal, proj, geos, spatialite, sqlite, geotiff, tiff, webp, exfat, zlib and iconv to React Native.
                </Description>
                <List>
                    <ListItem>
                        <ListItemTitle>License:</ListItemTitle>
                        <ListItemSubtitle>GNU Lesser General Public License v2.1 or later</ListItemSubtitle>
                    </ListItem>
                    <ListItem>
                        <ListItemTitle>Source Code:</ListItemTitle>
                        <ListItemSubtitle onPress={() => Linking.openURL('https://github.com/bugra9/gdal3.js')}>https://github.com/bugra9/gdal3.js</ListItemSubtitle>
                    </ListItem>
                    <ListItem>
                        <ListItemTitle>Documentation:</ListItemTitle>
                        <ListItemSubtitle onPress={() => Linking.openURL('https://gdal3.js.org/docs')}>https://gdal3.js.org/docs</ListItemSubtitle>
                    </ListItem>
                </List>
            </MainContainer>
            <Copyright>
                <CopyrightTitle onPress={() => Linking.openURL('https://github.com/bugra9')}>Copyright © 2024 Buğra Sarı</CopyrightTitle>
                <CopyrightDescription onPress={() => navigation.navigate('Licenses')}>gdal3.js is made possible by the Gdal open source project and other open source software.</CopyrightDescription>
            </Copyright>
        </Container>
    );
}

const Container = styled.View`
    flex: 1;
    padding-top: ${({ insets }) => insets.top || 0}px;
    background-color: white;
`;

const MainContainer = styled.View`
    flex: 1;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 20px;
    gap: 16px;
`;

const TitleContainer = styled.View`
    flex-direction: row;
    align-items: flex-end;
    gap: 4px;
    margin-bottom: 16px;
`;

const Title = styled.Text`
    font-size: 24px;
    font-weight: bold;
`;

const Version = styled.Text`
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 2px;
`;

const Description = styled.Text`
    font-size: 12px;
`;

const List = styled.View`
    gap: 12px;
    margin-top: 16px;
`;
const ListItem = styled.View`
`;

const ListItemTitle = styled.Text`
    font-size: 12px;
    font-weight: bold;
`;
const ListItemSubtitle = styled.Text`
    font-size: 12px;
`;

const Copyright = styled.View`
    align-items: center;
    gap: 12px;
    align-self: flex-end;
    width: 100%;
    background-color: rgb(245, 246, 247);
    padding: 12px 20px;
`;

const CopyrightTitle = styled.Text`
    font-size: 12px;
    color: rgb(28, 30, 33);
`;
const CopyrightDescription = styled.Text`
    font-size: 12px;
    text-align: center;
    color: rgb(28, 30, 33);
    text-decoration: underline;
`;
