import axios from 'axios';
import { throttledGetDataFromApi, THROTTLE_TIME } from './index';

jest.mock('axios');

const mockResponseData = {
  id: 1,
  title: 'foo',
  body: 'bar',
  userId: 1,
};

describe('throttledGetDataFromApi function', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should initialize axios instance with correct base URL', async () => {
    const axiosGetMock = jest.fn(() =>
      Promise.resolve({ data: mockResponseData }),
    );
    (axios.create as jest.Mock).mockReturnValue({
      get: axiosGetMock,
    });
    const baseUrl = 'https://jsonplaceholder.typicode.com';

    await throttledGetDataFromApi('/posts');

    expect(axios.create).toHaveBeenCalledWith({ baseURL: baseUrl });
    expect((axios.create as jest.Mock).mock.calls[0][0]).toStrictEqual({
      baseURL: baseUrl,
    });
  });

  test('should send a request to the correct URL', async () => {
    const axiosGetMock = jest.fn(() =>
      Promise.resolve({ data: mockResponseData }),
    );
    (axios.create as jest.Mock).mockReturnValue({
      get: axiosGetMock,
    });

    jest.advanceTimersByTime(THROTTLE_TIME);
    await throttledGetDataFromApi('/posts');

    expect(axiosGetMock).toHaveBeenCalledWith('/posts');
  });

  test('should return the expected response data', async () => {
    const axiosGetMock = jest.fn(() =>
      Promise.resolve({ data: mockResponseData }),
    );
    (axios.create as jest.Mock).mockReturnValue({
      get: axiosGetMock,
    });

    jest.advanceTimersByTime(THROTTLE_TIME);
    const result = await throttledGetDataFromApi('/posts');

    expect(result).toStrictEqual(mockResponseData);
  });
});
