import { useState } from 'react';
import { TextInput, Text } from 'react-native';
import { Button } from '@rneui/themed';
import styled from 'styled-components/native';
import { observer } from 'mobx-react-lite';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DropdownLightTheme from '../constants/DropdownLightTheme.js';
import gdalStore from '../store/gdalStore.js';

DropDownPicker.addTheme('DropdownLightTheme', DropdownLightTheme);
DropDownPicker.setTheme('DropdownLightTheme');

function ConvertScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [formatOpen, setFormatOpen] = useState(false);
    const [projOpen, setProjOpen] = useState(false);

    return (
        <Container insets={insets}>
            <Field>
                <Label>Format (Required)</Label>
                <DropDownPicker
                    open={formatOpen}
                    value={gdalStore.translateFormat}
                    items={gdalStore.formatList}
                    setOpen={setFormatOpen}
                    setValue={callback =>
                        gdalStore.setTranslateFormat(
                            callback(gdalStore.formatList),
                        )
                    }
                    searchable={true}
                    categorySelectable={false}
                    listMode="MODAL"
                    modalAnimationType="slide"
                />
            </Field>
            {gdalStore.program === 'vectorTranslate' && (
                <Field>
                    <Label>Projection</Label>
                    <DropDownPicker
                        open={projOpen}
                        value={gdalStore.projection}
                        items={gdalStore.crs}
                        setOpen={setProjOpen}
                        setValue={callback =>
                            gdalStore.setProjection(
                                callback(gdalStore.projection),
                            )
                        }
                        searchable={true}
                        listMode="MODAL"
                        modalAnimationType="slide"
                    />
                </Field>
            )}
            {gdalStore.program === 'vectorTranslate' && (
                <Field>
                    <Label>Query</Label>
                    <Input
                        value={gdalStore.query}
                        onChangeText={value => gdalStore.setQuery(value)}
                        placeholder="eg: SELECT * FROM CITIES"
                        placeholderTextColor="#74809d"
                    />
                </Field>
            )}
            <Field>
                <Label>Options</Label>
                <Input
                    value={gdalStore.options}
                    onChangeText={value => gdalStore.setOptions(value)}
                    placeholder="eg: -order 1"
                    placeholderTextColor="#74809d"
                />
            </Field>
            <Field>
                <Label>Command Preview</Label>
                <PreviewText>{gdalStore.preview}</PreviewText>
            </Field>
            <Field>
                <Button
                    type="solid"
                    onPress={() =>
                        gdalStore
                            .translate()
                            .then(() => navigation.navigate('AllFiles'))
                    }>
                    Convert
                </Button>
            </Field>
        </Container>
    );
}

export default observer(ConvertScreen);

const Container = styled.View`
    margin-top: ${p => p.insets.top || 0}px;
    flex: 1;
    justify-content: center;
    padding: 20px;
    gap: 24px;
    background-color: white;
`;

const Field = styled.View`
    gap: 8px;
`;

const Label = styled.Text`
    font-weight: bold;
`;

const Input = styled(TextInput)`
    border: 1px solid #dedede;
    min-height: 40px;
    padding-horizontal: 10px;
    color: #44506d;
`;

const PreviewText = styled(Text)`
    padding-top: 10px;
    border: 1px solid #dedede;
    min-height: 40px;
    padding-horizontal: 10px;
    color: #44506d;
`;
