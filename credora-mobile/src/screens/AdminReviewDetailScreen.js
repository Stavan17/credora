import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import tw from 'twrnc';
import api from '../api/config';
import { useRoute, useNavigation } from '@react-navigation/native';

const AdminReviewDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { applicationId } = route.params;
  
  const [appData, setAppData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, docsRes] = await Promise.all([
        api.get(`/api/loan/status/${applicationId}`),
        api.get(`/api/loan/documents/${applicationId}`)
      ]);
      setAppData(appRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      console.log('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    setProcessing(true);
    try {
      const formData = new URLSearchParams();
      formData.append('decision', decision);
      await api.post(`/api/loan/review/${applicationId}`, formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      Alert.alert('Success', `Application ${decision.toLowerCase()} successfully!`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update application.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <View style={tw`flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <ScrollView style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-16`} contentContainerStyle={tw`p-6 pb-20`}>
      <Text style={tw`text-3xl font-black text-gray-900 dark:text-white mb-2`}>Admin Verification</Text>
      <Text style={tw`text-gray-500 mb-6 font-bold`}>Application ID #{applicationId}</Text>
      
      <View style={tw`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6`}>
         <Text style={tw`text-lg font-black text-gray-800 dark:text-white mb-1`}>{appData?.user?.full_name}</Text>
         <Text style={tw`text-gray-500 mb-4 font-medium`}>{appData?.user?.email}</Text>
         <View style={tw`flex-row justify-between pt-4 border-t border-gray-100 dark:border-gray-700`}>
             <Text style={tw`text-gray-600 dark:text-gray-300 font-bold`}>Loan Amount: ₹{appData?.loan_amount}</Text>
             <Text style={tw`font-black text-blue-600 dark:text-blue-400`}>AI Score: {(appData?.approval_probability * 100).toFixed(1)}%</Text>
         </View>
      </View>

      <Text style={tw`text-xl font-bold mb-4 text-gray-800 dark:text-gray-200`}>Verification Documents</Text>
      {documents.length === 0 ? <Text style={tw`text-gray-400 italic mb-6 font-medium`}>No hardware attachments sourced.</Text> : (
        <View style={tw`flex-row flex-wrap justify-between mb-6`}>
          {(() => {
            const uniqueDocs = [];
            const seenTypes = new Set();
            // Iterate backwards to get the latest ones first
            for (let i = documents.length - 1; i >= 0; i--) {
              if (!seenTypes.has(documents[i].type)) {
                uniqueDocs.push(documents[i]);
                seenTypes.add(documents[i].type);
              }
            }
            return uniqueDocs.reverse().map((doc, idx) => {
              const realUrl = doc.url.replace('localhost', api.defaults.baseURL.split('//')[1].split(':')[0]);
              return (
                <TouchableOpacity key={idx} style={tw`w-[48%] bg-white dark:bg-gray-800 p-4 rounded-2xl mb-4 border border-gray-200 dark:border-gray-700 shadow-sm`} onPress={() => Linking.openURL(realUrl)}>
                   <Text style={tw`text-xs font-bold text-gray-700 dark:text-gray-300 mb-1`} numberOfLines={1}>{doc.type}</Text>
                   <Text style={tw`text-[10px] text-blue-500 font-bold`}>View Document</Text>
                </TouchableOpacity>
              )
            });
          })()}
        </View>
      )}

      {appData?.status === 'UNDER_REVIEW' || appData?.status === 'PENDING' ? (
        <View style={tw`mt-2`}>
          <TouchableOpacity 
             style={tw`w-full bg-green-600 rounded-2xl py-4 items-center shadow-lg mb-4`} 
             onPress={() => handleDecision('APPROVED')} 
             disabled={processing}
          >
             <Text style={tw`text-white font-bold text-lg`}>Approve Application</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             style={tw`w-full bg-red-600 rounded-2xl py-4 items-center shadow-lg`} 
             onPress={() => handleDecision('REJECTED')} 
             disabled={processing}
          >
             <Text style={tw`text-white font-bold text-lg`}>Reject Application</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={tw`bg-gray-200 dark:bg-gray-800 p-5 rounded-2xl items-center border border-gray-300 dark:border-gray-600`}>
           <Text style={tw`text-gray-600 dark:text-gray-300 font-bold text-sm tracking-wide`}>Status: {appData?.status}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AdminReviewDetailScreen;
