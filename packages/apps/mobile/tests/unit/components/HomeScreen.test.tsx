import { render } from '@testing-library/react-native';

import HomeScreen, { CustomText } from '@/components/HomeScreen';

describe('<HomeScreen />', () => {
  it('text renders correctly on HomeScreen', () => {
    expect.hasAssertions();

    const { getByText } = render(<HomeScreen />);

    const welcomeText = getByText('Welcome!');

    expect(welcomeText).toBeDefined();
  });

  it('customText renders correctly', () => {
    expect.hasAssertions();

    const tree = render(<CustomText>Some text</CustomText>).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
