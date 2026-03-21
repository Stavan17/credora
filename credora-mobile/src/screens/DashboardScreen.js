import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import tw from 'twrnc';
import api from '../api/config';
import { LogOut, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const endpoint = user?.is_admin ? '/api/loan/admin/all-applications' : '/api/loan/my-applications';
      const res = await api.get(endpoint);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return tw`bg-green-100 text-green-700`;
    if (status === 'REJECTED') return tw`bg-red-100 text-red-700`;
    if (status === 'UNDER_REVIEW') return tw`bg-blue-100 text-blue-700`;
    return tw`bg-yellow-100 text-yellow-700`;
  };

  return (
    <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900 pt-14`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-6 pb-4 border-b border-gray-200 dark:border-gray-800`}>
        <View>
          <Text style={tw`text-2xl font-black text-gray-900 dark:text-white`}>Credora {user?.is_admin ? 'Admin' : ''}</Text>
          <Text style={tw`text-sm font-medium text-gray-500`}>Signed in as {user?.full_name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={tw`bg-red-100 p-3 rounded-full shadow-sm`}>
          <LogOut color="#dc2626" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`p-6 h-full`}>
        
        {/* Metric Cards */}
        <View style={tw`flex-row flex-wrap justify-between mb-6`}>
          <View style={tw`w-[48%] bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-blue-500 mb-4`}>
            <Text style={tw`text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-1`}>Total</Text>
            <Text style={tw`text-3xl font-black dark:text-white`}>{applications.length}</Text>
          </View>
          <View style={tw`w-[48%] bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-green-500 mb-4`}>
            <Text style={tw`text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-wider mb-1`}>Approved</Text>
            <Text style={tw`text-3xl font-black text-green-600 dark:text-green-400`}>
              {applications.filter(a => a.status === 'APPROVED').length}
            </Text>
          </View>
        </View>

        {/* Data List */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold text-gray-800 dark:text-gray-200`}>
            {user?.is_admin ? "Global Pipeline" : "My Applications"}
          </Text>
          {!user?.is_admin && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('LoanApplication')}
              style={tw`bg-blue-600 px-4 py-2 rounded-full flex-row items-center`}
            >
              <PlusCircle color="white" size={16} />
              <Text style={tw`text-white font-bold ml-1`}>New</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {loading ? (
           <ActivityIndicator size="large" color="#2563eb" style={tw`mt-10`} />
        ) : applications.length === 0 ? (
           <View style={tw`items-center mt-10`}>
               <Text style={tw`text-gray-500 text-lg font-medium`}>No applications found.</Text>
           </View>
        ) : (
          applications.map(app => (
            <View key={app.id} style={tw`bg-white dark:bg-gray-800 p-5 mb-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700`}>
              <View style={tw`flex-row justify-between items-center mb-3`}>
                <Text style={tw`font-black text-lg text-gray-800 dark:text-white`}>
                  ₹ {app.loan_amount.toLocaleString()}
                </Text>
                <Text style={[tw`text-xs px-3 py-1 rounded-full font-bold overflow-hidden`, getStatusColor(app.status)]}>
                  {app.status}
                </Text>
              </View>
              
              <View style={tw`flex-row justify-between mt-2 pt-3 border-t border-gray-100 dark:border-gray-700`}>
                 <Text style={tw`text-xs text-gray-500 font-medium`}>CIBIL: {app.cibil_score || 'N/A'}</Text>
                 <Text style={tw`text-xs font-bold text-blue-600 dark:text-blue-400`}>
                   AI Score: {app.approval_probability ? (app.approval_probability * 100).toFixed(1) + '%' : 'N/A'}
                 </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
