import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarDays, ChevronRight, Clock3, Search } from 'lucide-react-native';
import { addHistoryListener, getHistory } from '../utils/storage';
import { formatMeetingAnalysis, getMeetingPreview, getMeetingTitle } from '../utils/meetingAnalysis';

const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

const padDatePart = value => value.toString().padStart(2, '0');

const getSearchableDateText = timestamp => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const paddedDay = padDatePart(day);
    const paddedMonth = padDatePart(month);
    const monthName = monthNames[month - 1];

    return [
        date.toLocaleString(),
        date.toLocaleDateString(),
        `${paddedDay}/${paddedMonth}/${year}`,
        `${day}/${month}/${year}`,
        `${paddedDay}-${paddedMonth}-${year}`,
        `${day}-${month}-${year}`,
        `${paddedDay}.${paddedMonth}.${year}`,
        `${day}.${month}.${year}`,
        `${day} ${monthName} ${year}`,
        `${paddedDay} ${monthName} ${year}`,
        `${monthName} ${day} ${year}`,
    ].join(' ');
};

const HistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const refreshHistory = useCallback(() => {
        setHistory(getHistory());
    }, []);

    useFocusEffect(refreshHistory);

    useEffect(() => {
        refreshHistory();

        const listener = addHistoryListener(() => {
            refreshHistory();
        });
        return () => listener.remove();
    }, [refreshHistory]);

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredHistory = normalizedSearch
        ? history.filter(item => {
            const date = getSearchableDateText(item.id);
            const content = formatMeetingAnalysis(item.content);
            const title = getMeetingTitle(item.content);
            return `${date} ${title} ${content}`.toLowerCase().includes(normalizedSearch);
        })
        : history;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
            <View style={styles.searchBox}>
                <Search size={19} color="#6B7280" />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search meeting history..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.searchInput}
                />
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Clock3 size={34} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No history yet</Text>
                    <Text style={styles.emptyText}>Analyzed meetings will appear here automatically.</Text>
                </View>
            ) : filteredHistory.length === 0 ? (
                <View style={styles.emptyState}>
                    <Search size={34} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No matches</Text>
                    <Text style={styles.emptyText}>Try searching for a different word or action item.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                navigation.navigate('Result', {
                                    analysis: item.content,
                                    transcript: item.transcript,
                                    title: getMeetingTitle(item.content),
                                });
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={styles.dateRow}>
                                <CalendarDays size={15} color="#2563EB" />
                                <Text style={styles.date}>
                                    {new Date(item.id).toLocaleString()}
                                </Text>
                            </View>
                            <Text numberOfLines={1} style={styles.cardTitle}>
                                {getMeetingTitle(item.content)}
                            </Text>
                            <View style={styles.previewRow}>
                                <Text numberOfLines={3} style={styles.preview}>
                                    {getMeetingPreview(item.content)}
                                </Text>
                                <ChevronRight size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    searchBox: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 2,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: '#111827',
        fontSize: 15,
        paddingVertical: 0,
    },
    listContent: {
        padding: 16,
        paddingBottom: 28,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 6,
        color: '#6B7280',
        lineHeight: 21,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 9,
    },
    date: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '700',
    },
    cardTitle: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 6,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    preview: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 21,
    },
})

export default HistoryScreen;
