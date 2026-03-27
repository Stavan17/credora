import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { BarChart } from 'react-native-chart-kit';

const AdminAnalyticsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.log('Analytics network error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <View style={tw`flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  const screenWidth = Dimensions.get("window").width - 48;

  const chartConfig = {
    backgroundGradientFrom: "#1e3a8a",
    backgroundGradientTo: "#1e40af",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
  };

  const overviewData = {
    labels: ["Total", "Approved", "Rejected"],
    datasets: [{ data: [data.overview.total_applications, data.overview.approved, data.overview.rejected] }]
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16`} contentContainerStyle={tw`p-6 pb-20`}>
      <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>Analytics Dashboard</Text>
      <Text style={tw`text-gray-500 mb-8 font-bold`}>Platform Overview</Text>

      <View style={tw`bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-500/30 mb-8`}>
         <Text style={tw`text-blue-200 font-bold text-xs uppercase tracking-widest mb-1`}>Total Approved Amount</Text>
         <Text style={tw`text-4xl font-black text-white`}>₹{data.overview.total_approved_amount.toLocaleString()}</Text>
       </View>

      <Text style={tw`text-xl font-bold mb-4 text-gray-800 dark:text-white`}>Application Distribution</Text>
      <View style={tw`items-center overflow-hidden rounded-3xl mb-8 shadow-lg`}>
        <BarChart
          data={overviewData}
          width={screenWidth}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          fromZero
        />
      </View>
    </ScrollView>
  );
};

export default AdminAnalyticsScreen;
