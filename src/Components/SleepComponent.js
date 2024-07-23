import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const SleepComponent = () => {
    const data = {
        labels: ['Th 2', 'Th 3', 'Th 4'],
        datasets: [
            {
                data: [6, 7, 12],
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: 'white',
        backgroundGradientTo: 'white',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        barPercentage: 0.5,
        fillShadowGradient: `rgba(245, 148, 39, 0.8)`,
        fillShadowGradientOpacity: 1,
        withVerticalLabels: true,

        labelFormatter: (value) => `${value}`,
    };
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row' }}>
                <Icon name={'moon'} size={24} color="black" />
                <View style={{ marginStart: 5 }}>
                    <Text style={styles.title}>Sleep</Text>
                    <Text style={styles.sleepTime}>8h 20m</Text>
                </View>
            </View>

            <View style={styles.graph}>
                <BarChart
                    data={data}
                    width={133}
                    height={79}
                    chartConfig={chartConfig}
                    verticalLabelRotation={0}
                    withInnerLines={true}
                    showBarTops={true}
                    fromZero={true}
                    showValuesOnTopOfBars={true}
                    style={{
                        borderRadius: 10,
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 150,
        height: 150,
        padding: 10,
        backgroundColor: 'rgba(68, 211, 224, 0.5)',
        borderRadius: 20,
    },
    title: {

        fontSize: 14,
        fontWeight: 'bold',
        color: '#36454F',
    },
    sleepTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#36454F',
        marginVertical: 10,
    },
    graph: {
        height: 70,
        // backgroundColor: 'red',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SleepComponent;
