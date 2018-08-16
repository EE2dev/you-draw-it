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

  return stateAPI; 
}