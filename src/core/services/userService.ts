interface UserDetails {
  user: {
    id: number;
    chain: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    type: string;
  };
  wallet_address: string;
}

interface UserDetailsResponse {
  success: boolean;
  message: string;
  data: UserDetails;
}

export async function getUserDetails(userId: number): Promise<UserDetails> {
  try {
    const response = await fetch(`/api/user/${userId}/details`);
    const data: UserDetailsResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user details');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}