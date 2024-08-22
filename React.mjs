let hooks = [],
    currentHook = 0;

// MyReact
const MyReact = {
    render(Component) {
        const Comp = Component(); // 컴포넌트를 실행하여 이펙트들을 처리
        Comp.render(); // 컴포넌트의 렌더링 함수 실행
        currentHook = 0; // 모든 렌더링이 끝나면 다시 처음부터 실행될 수 있도록 초기화
        return Comp; // 컴포넌트 반환
    },
};

// useState
const useState = (initialValue) => {
    // 지금 훅의 인덱스에 = 현재 호출시점에 값이 있으면 넣고 || 없으면 기본값
    // 값이 초기화되지 않았다면, 초기값을 할당
    hooks[currentHook] = hooks[currentHook] || initialValue;
    // 지금 실행하려는 인덱스를 받음
    const hookIndex = currentHook;
    const setState = (newState) => {
        // 함수(function) 타입이면
        if (typeof newState === "function") {
            // 함수를 실행
            hooks[hookIndex] = newState(hooks[hookIndex]);
        } else {
            // 훅의 지금 실행하려는 인덱스에 실제 값(바꿔주려는 값)을 넣음
            hooks[hookIndex] = newState;
        }
    };
    // 지금 currentHook의 인덱스를 반환하고 다음 훅으로 넘어감
    return [hooks[currentHook++], setState];
};

// useEffect
const useEffect = (callback, depArray) => {
    // 의존성 배열(Dependency Array)이 없거나
    const hasNoDeps = !depArray;
    // 이전 Deps = 현재 위치에 훅이 있다면 ? 그 훅의 의존성 배열을 가져옴 : 없으면 undefined
    const prevDeps = hooks[currentHook] ? hooks[currentHook].deps : undefined;
    // 이전 클린업 = 현재 위치에 훅이 있다면 ? 그 훅의 클린업 함수를 가져옴 : 없으면 undefined
    const prevCleanUp = hooks[currentHook] ? hooks[currentHook].cleanUp : undefined;
    // 변경되었는지는 = 이전 Deps가 있다면 ? 의존성 배열 안에 있는 모든값이 각각의 prevDeps값과 같은지 확인 : 없거나 비어있으면 true
    const hasChangedDeps = prevDeps ? !depArray.every((el, i) => el === prevDeps[i]) : true;

    if (hasNoDeps || hasChangedDeps) {
        // 이전 클린업 실행
        if (prevCleanUp) prevCleanUp();
        // 현재 콜백 실행, 현재 콜백의 반환값을 클린업으로 받아서
        const cleanUp = callback();
        // 다음번에 사용할 수 있게 클린업에 넣음, 다음번 실행에서는 hooks[currentHook]에 { deps: depArray, cleanUp }가 들어가 있음
        hooks[currentHook] = { deps: depArray, cleanUp };
    }
    // 다음 훅으로 넘어감
    currentHook++;
};

MyReact.useState = useState;
MyReact.useEffect = useEffect;
export { useState, useEffect };
export default MyReact;
