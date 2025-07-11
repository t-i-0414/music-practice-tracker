import { render } from '@testing-library/react-native';

import HomeScreen, { CustomText } from '@/components/HomeScreen';

describe('<HomeScreen />', () => {
  it('text renders correctly on HomeScreen', () => {
    expect.hasAssertions();

    const { getByText } = render(<HomeScreen />);

    getByText('Welcome!');

    expect(1).toBe(1);
  });

  it('customText renders correctly', () => {
    expect.hasAssertions();

    const tree = render(<CustomText>Some text</CustomText>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
