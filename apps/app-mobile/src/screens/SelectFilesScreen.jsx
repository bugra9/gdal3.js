import styled from 'styled-components/native';
import { Pressable } from 'react-native';
import { pick } from 'react-native-document-picker';
import { observer } from 'mobx-react-lite';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import { FAB } from '@rneui/themed';
import gdalStore from '../store/gdalStore.js';

function SelectFilesScreen({ navigation }) {
    const FileViews = gdalStore.datasets.map((dataset, i) => {
        const title = gdalStore.datasetsInfo[i].description.split('/').at(-1);
        return (
            <FileInfoContainer key={title}>
                <FileInfoHeader>
                    <FileInfoHeaderIconContainer>
                        <EntypoIcon
                            name="chevron-right"
                            size={18}
                            color="#74809d"
                        />
                    </FileInfoHeaderIconContainer>
                    <FileInfoHeaderDescContainer
                        onPress={() =>
                            navigation.navigate('InfoScreen', {
                                data: gdalStore.datasetsInfo[i],
                            })
                        }>
                        <FileInfoHeaderDescContainerHeader>
                            {title}
                        </FileInfoHeaderDescContainerHeader>
                        <FileInfoHeaderDescContainerDesc>
                            {gdalStore.datasetsInfo[i].driverLongName} (
                            {gdalStore.datasetsInfo[i].type})
                        </FileInfoHeaderDescContainerDesc>
                    </FileInfoHeaderDescContainer>
                    <FileInfoHeaderIconContainer
                        onPress={() => gdalStore.deleteDataset(i)}>
                        <EntypoIcon name="trash" size={24} color="red" />
                    </FileInfoHeaderIconContainer>
                </FileInfoHeader>
            </FileInfoContainer>
        );
    });

    return (
        <Container>
            <FAB
                title="Select File"
                visible={true}
                icon={{ name: 'add', color: 'white' }}
                placement="right"
                color="tomato"
                onPress={async () => {
                    try {
                        const [pickResult] = await pick({
                            copyTo: 'documentDirectory',
                        });
                        console.log(pickResult);
                        gdalStore.open(
                            pickResult.fileCopyUri || pickResult.uri,
                        );
                    } catch (err) {
                        // see error handling
                    }
                }}
            />
            {FileViews}
            <SampleContainer>
                {gdalStore.datasets.length === 0 && (
                    <SampleText
                        onPress={() => gdalStore.loadSampleGeojsonDataset()}>
                        Add Sample Geojson
                    </SampleText>
                )}
            </SampleContainer>
        </Container>
    );
}

export default observer(SelectFilesScreen);

const Container = styled.View`
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 20px 20px 20px;
    background-color: white;
`;

const FileInfoContainer = styled.View`
    width: 100%;
    background-color: white;
    border-radius: 8px;
    padding: 8px 0px;
    color: white;
    overflow: hidden;
    border-radius: 8px;
    margin-vertical: 2px;
`;

const FileInfoHeader = styled.View`
    flex-direction: row;
    width: 100%;
    background: white;
    height: 50px;
`;

const FileInfoHeaderIconContainer = styled(Pressable)`
    justify-content: center;
    align-items: center;
    width: 50px;
`;

const FileInfoHeaderDescContainer = styled(Pressable)`
    flex: 1;
    justify-content: center;
`;

const FileInfoHeaderDescContainerHeader = styled.Text`
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #74809d;
`;

const FileInfoHeaderDescContainerDesc = styled.Text`
    font-size: 10px;
    color: #74809d;
`;

const SampleContainer = styled.View`
    height: 40px;
    margin-top: 20px;
    width: 100%;
    justify-content: center;
    z-index: -1;
`;

const SampleText = styled.Text`
    font-size: 12px;
    color: #74809d;
`;
