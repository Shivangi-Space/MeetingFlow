import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert, StatusBar } from 'react-native';
import { FileText, History, Sparkles } from 'lucide-react-native';
import { useMeetingStore } from '../store/useMeetingStore';

export const HomeScreen = ({ navigation }) => {
    const { transcript, isLoading, error, setTranscript, processMeeting } = useMeetingStore();

    const handleGenerate = async() => {
        if(transcript.trim() === '') {
            Alert.alert('Error', 'Please enter a transcript first.');
            return;
        }

        await processMeeting();
        const currentAnalysis = useMeetingStore.getState().analysis;

        if(currentAnalysis) {
            navigation.navigate('Result');
            console.log("Result: ", currentAnalysis);
        } else {
            const currentError = useMeetingStore.getState().error || error;
            Alert.alert('Error', currentError || 'Failed to get analysis. Please try again.');
        }
    }

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <FileText size={24} color="#2563EB" />
                    </View>
                    <Text style={styles.title}>Meeting Notes</Text>
                    <Text style={styles.subtitle}>
                        Paste your transcript and turn it into a clear summary, action items, and follow-up email.
                    </Text>
                </View>

                <View style={styles.inputShell}>
                    <View style={styles.inputHeader}>
                        <Text style={styles.label}>Transcript</Text>
                        <Text style={styles.counter}>{transcript.length} chars</Text>
                    </View>

                    <TextInput
                        multiline
                        numberOfLines={10}
                        value={transcript}
                        onChangeText={setTranscript}
                        style={styles.input}
                        placeholder="Paste meeting transcript here..."
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleGenerate}
                    disabled={isLoading}
                    activeOpacity={0.85}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Sparkles size={20} color="#fff" />
                            <Text style={styles.buttonText}>Analyze Meeting</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => navigation.navigate('History')}
                    activeOpacity={0.85}
                >
                    <History size={19} color="#2563EB" />
                    <Text style={styles.historyBtnText}>View History</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        padding: 20,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 22,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#DBEAFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280',
    },
    inputShell: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    counter: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 14,
        minHeight: 240,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: '#111827',
        fontSize: 15,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#2563EB',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 20,
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.75,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    historyBtn: {
        marginTop: 14,
        paddingVertical: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        backgroundColor: '#EFF6FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    historyBtnText: {
        color: '#2563EB',
        fontWeight: '700',
        fontSize: 15,
    }
})

