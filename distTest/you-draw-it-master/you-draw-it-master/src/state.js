export default function() {
  let state = {}; 
  stateAPI();

  function stateAPI(){ state = {};}
  
  stateAPI.setQuestion = function(question){
    if (!state[question]) {
      state[question] = {};
    }
  };
  
  stateAPI.getQuestion = function(question){
    return state[question];
  };

  stateAPI.getAllQuestions = function(){
    return Object.keys(state);
  };

  stateAPI.getState = function(){
    return state;
  };

  stateAPI.set = function(question, key, value){
    if (!state[question][key]) {
      state[question][key] = {};
    }
    state[question][key] = value;
  };

  stateAPI.get = function(question, key){
    return state[question][key];
  };

  // for calculating the score
  stateAPI.getResult = function(question, key){
    const oldArray = state[question][key];
    // remove first element for line charts, which was not a prediction but the starting point for the line
    let newArray = oldArray.length > 1 ? oldArray.slice(1) : oldArray;
    return newArray;
  };

  return stateAPI; 
}