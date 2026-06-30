import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { useMeetingStore } from '../store/useMeetingStore';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import Markdown from 'react-native-markdown-display';
import { ClipboardCopyIcon, FileCheck2, RefreshCcw, Share2 } from 'lucide-react-native';
import { formatMeetingAnalysis, getMeetingTitle, normalizeMeetingAnalysis } from '../utils/meetingAnalysis';

const resultCards = [
    { key: 'summary', title: 'Summary' },
    { key: 'keyDiscussionPoints', title: 'Key Discussion Points' },
    { key: 'actionItems', title: 'Action Items' },
    { key: 'followUpEmail', title: 'Follow-up Email' },
];

const ResultScreen = ({ route, navigation }) => {
    const { analysis, transcript, isLoading, error, processMeeting } = useMeetingStore();
    const visibleAnalysis = route?.params?.analysis || analysis;
    const visibleTranscript = route?.params?.transcript || transcript;
    const sections = normalizeMeetingAnalysis(visibleAnalysis);
    const meetingTitle = route?.params?.title || getMeetingTitle(visibleAnalysis);

    useEffect(() => {
        navigation.setOptions({ title: meetingTitle || 'Meeting Insights' });
    }, [meetingTitle, navigation]);

    const copyToClipboard = (title, content) => {
        Clipboard.setString(content || '');
        Alert.alert('Copied', `${title} copied to clipboard`);
    };

    const shareResult = async() => {
        try {
            await Share.open({ message: formatMeetingAnalysis(visibleAnalysis) });
        } catch (shareError) {
            console.log('Error sharing result:', shareError);
        }
    };

    const regenerateAnalysis = async () => {
        if (!visibleTranscript) {
            Alert.alert('Regenerate unavailable', 'Original transcript is not available for this saved result.');
            return;
        }

        await processMeeting(visibleTranscript);
        const currentError = useMeetingStore.getState().error || error;

        if (currentError) {
            Alert.alert('Error', currentError);
            return;
        }

        navigation.setParams({ analysis: undefined, transcript: visibleTranscript });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <FileCheck2 size={24} color="#059669" />
                    </View>
                    <Text style={styles.title}>{meetingTitle}</Text>
                    <Text style={styles.subtitle}>Review your meeting summary and share it when it looks good.</Text>
                </View>

                {resultCards.map(card => {
                    const content = sections[card.key] || 'No content available.';

                    return (
                        <View key={card.key} style={styles.sectionCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.sectionTitle}>{card.title}</Text>
                                <TouchableOpacity
                                    style={styles.copyIconButton}
                                    onPress={() => copyToClipboard(card.title, content)}
                                    activeOpacity={0.8}
                                >
                                    <ClipboardCopyIcon size={18} color="#2563EB" />
                                </TouchableOpacity>
                            </View>
                            <Markdown style={markdownStyles}>{content}</Markdown>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.regenerateBtn, isLoading && styles.disabledButton]}
                    onPress={regenerateAnalysis}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <RefreshCcw size={20} color="#fff" />
                            <Text style={styles.btnText}>Regenerate</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.shareBtn]} onPress={shareResult}>
                    <Share2 size={20} color="#fff" />
                    <Text style={styles.btnText}>Share</Text>
                </TouchableOpacity>
            </View>

        </View>
    )

}

const styles= StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 110,
    },
    header: {
        marginBottom: 22,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280',
    },
    sectionCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
    },
    copyIconButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    buttonContainer: {
        flexDirection: 'row',
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 22,
        gap: 12,
    },
    regenerateBtn: {
        backgroundColor: '#2563EB',
    },
    shareBtn: {
        backgroundColor: '#059669',
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 15,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.75,
    }
});

const markdownStyles = StyleSheet.create({
    body: {
        color: '#1F2937',
        fontSize: 15,
        lineHeight: 23,
    },
    heading1: {
        fontSize: 18,
        color: '#111827',
        fontWeight: '800',
        marginTop: 4,
        marginBottom: 6,
    },
    heading2: {
        fontSize: 17,
        color: '#111827',
        fontWeight: '800',
        marginTop: 4,
        marginBottom: 6,
    },
    bullet_list: {
        marginBottom: 0,
    },
    ordered_list: {
        marginBottom: 0,
    },
    list_item: {
        marginBottom: 4,
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },
    strong: {
        color: '#111827',
        fontWeight: '800',
    },
});

export default ResultScreen;
