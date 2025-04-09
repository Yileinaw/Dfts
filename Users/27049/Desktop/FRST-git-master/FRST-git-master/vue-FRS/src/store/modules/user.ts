import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import type { UserInfo } from '@/types/api';
import type { CollectionItem, CollectionType } from '@/types/collection'; // Import CollectionType
import { ElMessage } from 'element-plus'; // Import ElMessage for feedback
// import { getUserProfile } from '@/api/user'; // 不再需要引入实际 API

const USER_INFO_STORAGE_KEY = 'user_info';
const COLLECTIONS_STORAGE_KEY = 'frs_collections'; // New key for collections

function loadFromStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored) as T;
        } catch (e) {
            console.error(`Error parsing stored data for key ${key}:`, e);
            localStorage.removeItem(key);
        }
    }
    return null;
}

// Define mock collections directly here
const MOCK_COLLECTIONS: CollectionItem[] = [
    {
        id: 1,
        collectedId: 101,
        type: 'post',
        title: '社区帖子：美味的周末早午餐分享',
        imageUrl: 'https://via.placeholder.com/150/FFA07A/000000?text=Post1',
        collectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        link: '/community/post/101'
    },
    {
        id: 2,
        collectedId: 205,
        type: 'food',
        title: '特色菜品：秘制红烧肉',
        imageUrl: 'https://via.placeholder.com/150/98FB98/000000?text=Food1',
        collectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        link: '/food/205' // Assuming /food/:id route exists later
    },
    {
        id: 3,
        collectedId: 108,
        type: 'post',
        title: '探店笔记：城中最火的咖啡馆',
        imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?text=Post2',
        collectedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        link: '/community/post/108'
    },
];

// 模拟用户数据 (根据需要调整)
const mockUser: UserInfo = {
    id: 999,
    username: '模拟用户',
    avatar: '', // 可以留空或指向一个默认头像 URL
};

// Helper to generate next collection ID
let nextCollectionIdCounter = Date.now(); // Simple unique ID generator
const getNextCollectionId = () => nextCollectionIdCounter++;

export const useUserStore = defineStore('user', () => {
    // Initialize state from localStorage if available
    const userInfo = ref<UserInfo | null>(loadFromStorage<UserInfo>(USER_INFO_STORAGE_KEY));
    // Load collections from localStorage, default to empty array
    const collections = ref<CollectionItem[]>(loadFromStorage<CollectionItem[]>(COLLECTIONS_STORAGE_KEY) || []);
    const hasFetchedCollections = ref(false); // Add flag for collection fetch optimization

    // Watchers for persistence
    watch(userInfo, (newUserInfo) => {
        if (newUserInfo) {
            localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(newUserInfo));
        } else {
            localStorage.removeItem(USER_INFO_STORAGE_KEY);
        }
    }, { deep: true }); // Use deep watch for nested properties like avatar

    watch(collections, (newCollections) => {
        localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(newCollections));
    }, { deep: true });

    function setUser(newUserInfo: UserInfo | null) {
        // This will trigger the watcher to save to localStorage
        userInfo.value = newUserInfo;
    }

    function clearUser() {
        setUser(null); // Triggers watcher to remove from localStorage
        collections.value = []; // Clear collections on logout
        localStorage.removeItem(COLLECTIONS_STORAGE_KEY); // Clear storage
        hasFetchedCollections.value = false; // Reset collection flag
    }

    // Action: 模拟获取用户信息并更新 store
    async function fetchUserInfo(): Promise<UserInfo | null> {
        // If already loaded from storage, maybe skip mock assignment
        if (userInfo.value) {
            console.log('User info already loaded from storage or fetched.');
            // Optionally, still run mock API call in background to simulate refresh
            // but be careful not to overwrite newer local changes like avatar
            // await new Promise(resolve => setTimeout(resolve, 50));
            return userInfo.value;
        }

        console.log('No user info in store, attempting to simulate...');
        await new Promise(resolve => setTimeout(resolve, 50));
        const shouldSimulateLogin = true;
        if (shouldSimulateLogin) {
            // Use mock data only if nothing was loaded from localStorage
            setUser({ ...mockUser });
            console.log('Simulated fetching user info:', userInfo.value);
            return userInfo.value;
        } else {
            clearUser();
            console.log('Simulated user is not logged in.');
            return null;
        }
    }

    const getUserInfo = (): UserInfo | null => {
        return userInfo.value;
    };

    const getUserId = (): number | undefined => {
        return userInfo.value?.id;
    };

    // --- Add updateAvatar Action ---
    function updateAvatar(newAvatar: string) {
        if (userInfo.value) {
            userInfo.value = { ...userInfo.value, avatar: newAvatar };
        } else {
            console.warn('Cannot update avatar: userInfo is null.');
        }
    }
    // ---------------------------------

    // --- Update Collection Actions to use fetch --- 
    async function fetchCollections() {
        if (hasFetchedCollections.value) {
            console.log('Collections already loaded/initialized.');
            return;
        }
        console.log('Initializing collections...');
        const storedCollections = loadFromStorage<CollectionItem[]>(COLLECTIONS_STORAGE_KEY);
        if (storedCollections && storedCollections.length > 0) {
            collections.value = storedCollections;
            console.log('Loaded collections from localStorage:', collections.value);
        } else {
            // LocalStorage is empty, populate with initial mock data
            console.log('No collections in localStorage, initializing with mock data.');
            collections.value = [...MOCK_COLLECTIONS]; // Assign mock data
            // Watcher will save this initial data to localStorage automatically
        }
        hasFetchedCollections.value = true;
    }

    // --- addCollection Action ---
    function addCollection(itemData: Omit<CollectionItem, 'id' | 'collectedAt'>): boolean {
        const alreadyExists = collections.value.some(
            item => item.type === itemData.type && item.collectedId === itemData.collectedId
        );

        if (alreadyExists) {
            ElMessage.warning('您已经收藏过该项目了');
            return false;
        }

        // Ensure a valid image URL, provide a fallback
        const imageUrl = itemData.imageUrl || `https://via.placeholder.com/150/EEEEEE/AAAAAA?text=No+Image`;

        const newCollectionItem: CollectionItem = {
            ...itemData,
            imageUrl: imageUrl, // Use the validated/fallback URL
            id: getNextCollectionId(),
            collectedAt: new Date().toISOString(),
        };

        collections.value.unshift(newCollectionItem);
        ElMessage.success('收藏成功!');
        console.log('Added collection:', newCollectionItem);
        return true;
    }

    // --- isCollected Computed/Getter ---
    const isCollected = computed(() => {
        // Return a function to allow passing arguments
        return (type: CollectionType, collectedId: number): boolean => {
            return collections.value.some(item => item.type === type && item.collectedId === collectedId);
        };
    });

    async function removeCollection(collectionId: number): Promise<boolean> {
        console.log(`Simulating remove collection with id: ${collectionId}...`);
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                const index = collections.value.findIndex(item => item.id === collectionId);
                if (index !== -1) {
                    collections.value.splice(index, 1);
                    console.log('Collection removed. Updated list:', collections.value);
                    ElMessage.success('已取消收藏');
                    resolve(true);
                } else {
                    console.error('Failed to remove collection: Item not found');
                    ElMessage.error('取消收藏失败：未找到该收藏项');
                    resolve(false);
                }
            }, 150); // Simulate 150ms delay
        });
    }
    // ---------------------------------------------

    // --- Actions for Settings Page ---
    async function updateUserProfile(profileData: Pick<UserInfo, 'username'>): Promise<boolean> {
        console.log('Simulating update profile:', profileData);
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                if (!userInfo.value) {
                    ElMessage.error('更新失败：用户信息不存在');
                    resolve(false);
                    return;
                }
                userInfo.value = { ...userInfo.value, username: profileData.username };
                ElMessage.success('用户名更新成功!');
                resolve(true);
            }, 200); // Simulate 200ms delay
        });
    }

    async function updatePassword(passwordData: { current: string, new: string }): Promise<boolean> {
        console.log('Simulating update password...');
        return new Promise<boolean>((resolve) => {
            setTimeout(() => {
                // Simple mock check
                if (passwordData.current !== 'password123') { // Assuming 'password123' is the mock current password
                    ElMessage.error('当前密码不正确');
                    resolve(false);
                } else if (passwordData.new.length < 6) {
                    ElMessage.error('新密码长度至少需要6位');
                    resolve(false);
                } else {
                    ElMessage.success('密码修改成功!');
                    resolve(true);
                }
            }, 250); // Simulate 250ms delay
        });
    }
    // ---------------------------------

    return {
        userInfo,
        collections, // Export collections state
        hasFetchedCollections, // Expose flag if needed by components
        setUser,
        clearUser,
        getUserInfo,
        getUserId,
        fetchUserInfo,
        updateAvatar, // Export the new action
        fetchCollections, // Export new actions
        addCollection, // Export new action
        removeCollection,
        updateUserProfile, // Export settings actions
        updatePassword,
        isCollected, // Export checker
    };
});
