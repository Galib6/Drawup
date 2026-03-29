

interface ILocalStorageState {
  connectionDetails: {
    key: string;
    initialValue: {
      token?: string;
      roomName?: string;
    };
  };

}

export const localStorageSate: ILocalStorageState = {
  connectionDetails: {
    key: '_jh52d_',
    initialValue: {
      token: "",
      roomName: "",
    },
  },


};
