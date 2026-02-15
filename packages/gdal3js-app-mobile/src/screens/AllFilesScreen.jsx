/* eslint-disable prettier/prettier */
import styled from 'styled-components/native';
import { Pressable, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import { pickDirectory, releaseSecureAccess } from 'react-native-document-picker';
import { observer } from 'mobx-react-lite';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import gdalStore from '../store/gdalStore.js';

function getFileSize(size) {
    if (size > 1073741824) { // 1024 * 1024 * 1024
        return ceil(size / 1073741824) + ' GB';
    } else if (size > 1048576) { // 1024 * 1024
        return ceil(size / 1048576) + ' MB';
    } else if (size > 1024) {
        return ceil(size / 1024) + ' KB';
    } else {
        return size + ' B';
    }
}
function ceil(num) {
    return Math.ceil(num * 10) / 10;
}

function getOutputPath(path) {
    let outputPath = path;
    if (Platform.OS === 'android') {
        let dirToRead = path.split('primary')[1];
        const InternalStoragePath =  RNFS.ExternalStorageDirectoryPath;
        dirToRead = InternalStoragePath + dirToRead.replace(/%3A/g, '%2F');
        outputPath = decodeURIComponent(dirToRead);
    }
    return decodeURIComponent(outputPath);
}

function AllFilesScreen() {
    const FileViews = gdalStore.files.map(file => {
        const title = file.path.replace(`${gdalStore.gdalPath}/`, '');
        return (
            <FileInfoContainer key={title} onPress={() => {
                pickDirectory({ requestLongTermAccess: false }).then(dir => {
                    RNFS.exists(file.path).then(status => {
                        if(status) {
                            RNFS.copyFile(file.path, getOutputPath(`${dir.uri}%2F${file.name}`))
                                .then(() => Toast.show({ type: 'success', text1: 'The file was saved successfully.', text1NumberOfLines: 2 }))
                                .catch(e => Toast.show({ type: 'error', text1: 'An error occurred.', text2: e.message }))
                                .finally(() => releaseSecureAccess([dir.uri]));
                        } else {
                            console.log('File not exists');
                        }
                    });
                });
            }}>
                <FileInfoHeader>
                    <FileInfoHeaderIconContainer>
                        <EntypoIcon
                            name="chevron-right"
                            size={18}
                            color="#74809d"
                        />
                    </FileInfoHeaderIconContainer>
                    <FileInfoHeaderDescContainer>
                        <FileInfoHeaderDescContainerHeader>
                            {title}
                        </FileInfoHeaderDescContainerHeader>
                        <FileInfoHeaderDescContainerDesc>
                            {getFileSize(file.size)}
                        </FileInfoHeaderDescContainerDesc>
                    </FileInfoHeaderDescContainer>
                    <FileInfoHeaderIconContainer>
                        <EntypoIcon name="download" size={24} />
                    </FileInfoHeaderIconContainer>
                </FileInfoHeader>
            </FileInfoContainer>
        );
    });

    return <Container>{FileViews}</Container>;
}

export default observer(AllFilesScreen);

const Container = styled.View`
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 20px 20px 20px;
    background-color: white;
`;

const FileInfoContainer = styled(Pressable)`
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

const FileInfoHeaderIconContainer = styled.View`
    justify-content: center;
    align-items: center;
    width: 50px;
`;

const FileInfoHeaderDescContainer = styled.View`
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
