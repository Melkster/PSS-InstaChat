import React from 'react';
//import HomeScreen from '../App';
import HomeScreenUI from '../HomeScreenUITest';

import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<HomeScreenUI />).toJSON();
  expect(tree).toMatchSnapshot();
});